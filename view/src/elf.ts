import * as intf from '../../intf/interface';
import * as common from './common';

export interface ElfHeader {
    Magic: string,
    Class: string,
    Data: string,
    ElfVersion: string,
    OsAbi: string,
    AbiVersion: number,
    Type: string,
    Machine: string,
    FileVersion: number,
    EntryPoint: number,
    StartOfPH: number, // Program header starts from X bytes (offset) from the start of the file.
    StartOfSH: number, // Section header starts from X bytes (offset) from the start of the file.
    ProcessorFlag: string,
    SizeEH: number, // Size of Elf Header
    SizePH: number, // Size of Program Header
    NumOfPH: number, // Number of Program Headers
    SizeSH: number, // Size of Section Header
    NumOfSH: number, // Size of Section Header
    SHStringTableIdx: number // 
}

//==== Following are Program Header Related Structures ====//
export enum ProgramHeaderFlag {
    Write = "W", // Writable Segment
    Read = "R", // Allocatable Segment
    Execute = "E" // Executable Segment
}

export enum ProgramHeaderType {
    PTNull = "NULL",
    PTLoad = "LOAD",
    PTDynamic = "DYNAMIC",
    PTInterp = "INTERP",
    PTNote = "NOTE",
    PTShlib = "SHLIB",
    PTPhdr ="PHDR",
    PTLoProc = "LOPROC",
    PTHiProc = "HIPROC",
    PTGnuStack = "GNU_STACK"
}

export interface ProgramHeader {
    Type : ProgramHeaderType,
    Offset: number,
    VirtAddr: number,
    PhysAddr: number,
    FileSiz: number,
    MemSize: number,
    Flg: ProgramHeaderFlag,
    Align: number,
    Sections: string[]
}


//==== Following are Section Header Related Structures ====//
export enum SectionHeaderType {
    SHTNull = "NULL",
    SHTProgbits = "PROGBITS",
    SHTSymbtab = "SYMTAB",
    SHTStrtab = "STRTAB",
    SHTRela = "RELA",
    SHTHash = "HASH",
    SHTDynamic = "DYNAMIC",
    SHTNote = "NOTE",
    SHTNobits = "NOBITS",
    SHTRel = "REL",
    SHTShlib = "SHLIB",
    SHTDynsym = "DYNSYM",
    SHTLoproc = "LOPROC",
    SHTHiproc = "HIPROC",
    SHTLouser = "LOUSER",
    SHTHiuser = "HIUSER"
}

export enum SectionHeaderFlag {
    SHFWrite = "W",
    SHFAlloc = "A",
    SHFExecInstr = "X",
    SHRMaskProc = "M"
}

export interface SectionHeader {
    Nr : number, // Number (This is not part of Section Header)
    Name: string,
    Type: SectionHeaderType,
    Address: number,
    Offset: number,
    Size: number,
    EntSize: number,
    Flags:  SectionHeaderFlag,
    Link: number, // Link to another section.
    Info: number, // Holds extra information.
    Align: number
}


export interface Elf {
    elfHeader : ElfHeader,
    programHeaders : ProgramHeader[],
    sectionHeaders : SectionHeader[]
}

//******ELF Header Related*******// 

// Post command for getting elf header and setup up callback to be called on receiving the response.
function getElfHeader(vscode: any, program: string, handle: common.ResposeHandler) {
    handle.registerHandler("eheader", (d) => elfHeaderParser(d, vscode, program))
    vscode.postMessage({ 
        id: "eheader",
        type: intf.RequestType.EXECUTE,
        data : {
            prog: "readelf",
            args: ["-h", `${program}`],
        }
    });
}


type FieldParser<T> = (match: RegExpMatchArray) => T;

const ELF_HEADER_FIELD_PATTERNS: Array<{ regex: RegExp, field: keyof ElfHeader, parser: FieldParser<any> }> = [
    // Strings first (order doesn't matter for strings)
    { regex: /Magic:\s+([0-9a-f\s]+)/i, field: 'Magic', parser: (m) => m[1]!.trim() },
    { regex: /Class:\s+(.+)/i, field: 'Class', parser: (m) => m[1]!.trim() },
    { regex: /Data:\s+(.+)/i, field: 'Data', parser: (m) => m[1]!.trim() },
    { regex: /Version:\s+(.+)/i, field: 'ElfVersion', parser: (m) => m[1]!.trim() }, // First match
    { regex: /OS\/ABI:\s+(.+)/i, field: 'OsAbi', parser: (m) => m[1]!.trim() },
    { regex: /Type:\s+(.+)/i, field: 'Type', parser: (m) => m[1]!.trim() },
    { regex: /Machine:\s+(.+)/i, field: 'Machine', parser: (m) => m[1]!.trim() },
    { regex: /Flags:\s+(.+)/i, field: 'ProcessorFlag', parser: (m) => m[1]!.trim() },

    // Numbers - capture numeric part, handle hex or decimal
    { regex: /ABI Version:\s+(\d+)/i, field: 'AbiVersion', parser: (m) => parseInt(m[1]!) },
    { regex: /Version:\s+(0x[0-9a-f]+)/i, field: 'FileVersion', parser: (m) => parseInt(m[1]!, 16) }, // Second match
    { regex: /Entry point address:\s+(0x[0-9a-f]+)/i, field: 'EntryPoint', parser: (m) => parseInt(m[1]!, 16) },
    
    // Offsets/sizes - capture before parentheses
    { regex: /Start of program headers:\s+(\d+)/, field: 'StartOfPH', parser: (m) => parseInt(m[1]!) },
    { regex: /Start of section headers:\s+(\d+)/, field: 'StartOfSH', parser: (m) => parseInt(m[1]!) },
    { regex: /Size of this header:\s+(\d+)/, field: 'SizeEH', parser: (m) => parseInt(m[1]!) },
    { regex: /Size of program headers:\s+(\d+)/, field: 'SizePH', parser: (m) => parseInt(m[1]!) },
    { regex: /Number of program headers:\s+(\d+)/, field: 'NumOfPH', parser: (m) => parseInt(m[1]!) },
    { regex: /Size of section headers:\s+(\d+)/, field: 'SizeSH', parser: (m) => parseInt(m[1]!) },
    { regex: /Number of section headers:\s+(\d+)/, field: 'NumOfSH', parser: (m) => parseInt(m[1]!) },
    { regex: /Section header string table index:\s+(\d+)/, field: 'SHStringTableIdx', parser: (m) => parseInt(m[1]!) }
];

function elfHeaderParser(data: intf.Result, vscode: any, program:string) {
    if (data.exitCode) {
        console.log(`'readelf -h <prog>', exit code is ${data.exitCode} (non-zero)`);
    }

    if (!data.stdout) {
        console.log(`'readelf -h <prog>', stdout is empty.`);
    }

    const result: Partial<ElfHeader> = {};
    
    for (const { regex, field, parser } of ELF_HEADER_FIELD_PATTERNS) {
        const match = data.stdout.match(regex);
        if (match) {
            result[field] = parser(match);
        }
    }
    
    if (Object.keys(result).length !== 19) {
        throw new Error(`Parsed ${Object.keys(result).length}/19 fields`);
    }

    const elfHeader = result as ElfHeader;
    
    vscode.setState({program : {ehdr: elfHeader}});
}

//******Program Header Related*******// 





//******Segment Header Related*******// 



//******Segment Header Related*******// 
export function getElf(vscode: any, program: string, handle: common.ResposeHandler) {
    getElfHeader(vscode, program, handle);
}

