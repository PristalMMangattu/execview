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
    PTNull = "NULL", /* Program header table entry unused */
    PTLoad = "LOAD", /* Loadable program segment */
    PTDynamic = "DYNAMIC", /* Dynamic linking information */
    PTInterp = "INTERP", /* Program interpreter */
    PTNote = "NOTE", /* Auxiliary information */
    PTShlib = "SHLIB", /* Reserved */
    PTPhdr ="PHDR", /* Entry for header table itself */
    PTTls = "TLS", /* Thread-local storage segment */
    PTNum = "NUM",		/* Number of defined types */
    PTLoos = "LOOS",			/* Start of OS-specific */
    PTGnuEhFrame = "GNU_EH_FRAME",	/* GCC .eh_frame_hdr segment */
    PTGnuStack = "GNU_STACK", /* Indicates stack executability */
    PTGnuRelro = "GNU_RELRO",	/* Read-only after relocation */
    PTGnuProperty = "GNU_PROPERTY",	/* GNU property */
    PTGnuSframe = "GNU_SFRAME",	/* SFrame segment.  */
    PTLosunw = "LOSUNW",
    PTSunwbss = "SUNWBSS",	/* Sun Specific segment */
    PTSunwstack = "SUNWSTACK",	/* Stack segment */
    PTHisunw = "HISUNW",
    PTHios = "HIOS",	/* End of OS-specific */
    PTLoProc = "LOPROC", /* Start of processor-specific */
    PTHiProc = "HIPROC", /* End of processor-specific */
}

export interface ProgramHeader {
    Type : ProgramHeaderType,
    Offset: number,
    VirtAddr: number,
    PhysAddr: number,
    FileSiz: number,
    MemSize: number,
    Flg: ProgramHeaderFlag[],
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
    Flags:  SectionHeaderFlag[],
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
    handle.registerHandler("eheader", (d) => elfHeaderParser(d, vscode))
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

function elfHeaderParser(data: intf.Result, vscode: any) {
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
    let state: common.State = {} as common.State;
    state.elfHeader = elfHeader;
    common.setStatePartial(vscode, state);
    console.log('State in elfHeaderParser:', vscode.getState());
}

//******Program Header Related*******// 

// Post command for getting program headers and setup callback
function getProgramHeaders(vscode: any, program: string, handle: common.ResposeHandler) {
    handle.registerHandler("pheaders", (d) => programHeaderParser(d, vscode));
    vscode.postMessage({ 
        id: "pheaders",
        type: intf.RequestType.EXECUTE,
        data: {
            prog: "readelf",
            args: ["-lW", `${program}`],
        }
    });
}

const PROGRAM_HEADER_LINE_REGEX = /^\s*([A-Z_]+)\s+(0x[0-9a-f]+)\s+(0x[0-9a-f]+)\s+(0x[0-9a-f]+)\s+(0x[0-9a-f]+)\s+(0x[0-9a-f]+)\s+([REW ]+)\s+(0x[0-9a-f]+)\s*$/i;

function programHeaderParser(data: intf.Result, vscode: any) {
    if (data.exitCode) {
        console.log(`'readelf -lW <prog>', exit code is ${data.exitCode} (non-zero)`);
        return;
    }

    if (!data.stdout) {
        console.log(`'readelf -lW <prog>', stdout is empty.`);
        return;
    }

    const programHeaders: ProgramHeader[] = [];
    const lines = data.stdout.split('\n');
    let inProgramHeaders = false;
    
    for (const line of lines) {
        // Skip until we reach Program Headers section
        if (line.includes('Program Headers:')) {
            inProgramHeaders = true;
            continue;
        }
        
        // Skip section mapping and other lines
        if (inProgramHeaders && line.trim() === '') {
            break;
        }
        
        if (!inProgramHeaders || line.trim().length === 0) {
            continue;
        }

        const match = line.match(PROGRAM_HEADER_LINE_REGEX);
        if (!match) continue;

        const [
            _full,      // 0: full match
            typeStr,    // 1: Type
            offset,     // 2: Offset (hex)
            virtAddr,   // 3: VirtAddr (hex)
            physAddr,   // 4: PhysAddr (hex)
            fileSiz,    // 5: FileSiz (hex)
            memSize,    // 6: MemSiz (hex)
            flags,      // 7: Flg (R, E, W, or combinations like REW)
            align       // 8: Align (hex)
        ] = match;

        // Map type string to ProgramHeaderType enum
        const type = (Object.values(ProgramHeaderType) as string[]).includes(typeStr) 
            ? typeStr as ProgramHeaderType 
            : ProgramHeaderType.PTNull;

        // Parse ALL flags - handle combinations (R, E, W, RE, RW, REW, etc.)
        const flagChars = flags.trim().split('').filter(c => c !== ' ');
        const flagArray: ProgramHeaderFlag[] = flagChars.map(f => {
            switch (f) {
                case 'R': return ProgramHeaderFlag.Read;
                case 'W': return ProgramHeaderFlag.Write;
                case 'E': return ProgramHeaderFlag.Execute;
                default: return null as any;
            }
        }).filter((f): f is ProgramHeaderFlag => f !== null);

        const programHeader: ProgramHeader = {
            Type: type,
            Offset: parseInt(offset, 16),
            VirtAddr: parseInt(virtAddr, 16),
            PhysAddr: parseInt(physAddr, 16),
            FileSiz: parseInt(fileSiz, 16),
            MemSize: parseInt(memSize, 16),
            Flg: flagArray,  // Now correctly typed as ProgramHeaderFlag[]
            Align: parseInt(align, 16),
            Sections: []     // Will be populated later if needed
        };

        programHeaders.push(programHeader);
    }

    if (programHeaders.length === 0) {
        console.log('No program headers parsed from readelf -lW output');
        return;
    }

    console.log(`Parsed ${programHeaders.length} program headers`);

    // Update state with program headers
    let state: common.State = {} as common.State;
    state.programHeaders = programHeaders;
    common.setStatePartial(vscode, state);
    
    console.log(`State updated with ${programHeaders.length} program headers`);
    console.log('State in programHeaderParser:', vscode.getState());
}


//******Segment Header Related*******// 
// Post command for getting section headers and setup callback
function getSectionHeaders(vscode: any, program: string, handle: common.ResposeHandler) {
    handle.registerHandler("sheaders", (d) => sectionHeaderParser(d, vscode));
    vscode.postMessage({ 
        id: "sheaders",
        type: intf.RequestType.EXECUTE,
        data: {
            prog: "readelf",
            args: ["-SW", `${program}`],
        }
    });
}

type SectionHeaderParser = (match: RegExpMatchArray) => Partial<SectionHeader>;

const SECTION_HEADER_LINE_REGEX = /^\s*\[\s*(\d+)\]\s+(\S+)?\s+(\S+)\s+([0-9a-f]+)\s+([0-9a-f]+)\s+([0-9a-f]+)\s+([0-9a-f]+)\s+([WAXEMISILO]*)\s+(\d+)\s+(\d+)\s+(\d+)\s*$/i;

function sectionHeaderParser(data: intf.Result, vscode: any) {
    if (data.exitCode) {
        console.log(`'readelf -SW <prog>', exit code is ${data.exitCode} (non-zero)`);
        return;
    }

    if (!data.stdout) {
        console.log(`'readelf -SW <prog>', stdout is empty.`);
        return;
    }

    const sectionHeaders: SectionHeader[] = [];
    const lines = data.stdout.split('\n');
    
    for (const line of lines) {
        const match = line.match(SECTION_HEADER_LINE_REGEX);
        if (!match) {
            console.log(`No Match : ${line}`);
            continue;
        }

        const [
            _full,      // 0: full match
            nr,         // 1: [Nr]
            name,       // 2: Name
            typeStr,    // 3: Type
            address,    // 4: Address (hex)
            offset,     // 5: Off (hex)
            size,       // 6: Size (hex)
            entSize,    // 7: ES (decimal)
            flags,      // 8: Flg
            link,       // 9: Lk
            info,       // 10: Inf
            align       // 11: Al
        ] = match;

        // Map type string to SectionHeaderType enum (handle unknown types gracefully)
        const type = (Object.values(SectionHeaderType) as string[]).includes(typeStr) 
            ? typeStr as SectionHeaderType 
            : SectionHeaderType.SHTNull;

        // Map ALL flags string chars to SectionHeaderFlag enum array
        const flagArray: SectionHeaderFlag[] = flags.split('').map(f => {
            switch (f) {
                case 'W': return SectionHeaderFlag.SHFWrite;
                case 'A': return SectionHeaderFlag.SHFAlloc;
                case 'X': return SectionHeaderFlag.SHFExecInstr;
                case 'M': return SectionHeaderFlag.SHRMaskProc;
                default: return null as any;
            }
        }).filter((f): f is SectionHeaderFlag => f !== null);

        const sectionHeader: SectionHeader = {
            Nr: parseInt(nr),
            Name: name ?? '',
            Type: type,
            Address: parseInt(address, 16),
            Offset: parseInt(offset, 16),
            Size: parseInt(size, 16),
            EntSize: parseInt(entSize),
            Flags: flagArray,  // Now correctly typed as SectionHeaderFlag[]
            Link: parseInt(link),
            Info: parseInt(info),
            Align: parseInt(align)
        };

        sectionHeaders.push(sectionHeader);
    }

    if (sectionHeaders.length === 0) {
        console.log('No section headers parsed from readelf -SW output');
        return;
    }

    console.log(`Parsed ${sectionHeaders.length} section headers`);

    // Update state with section headers
    let state: common.State = {} as common.State;
    state.sectionHeaders = sectionHeaders;
    common.setStatePartial(vscode, state);
    
    console.log(`State updated with ${sectionHeaders.length} section headers`);
    console.log('State in sectionHeaderParser:', vscode.getState());
}

//****** Public API*******// 
export function getElf(vscode: any, program: string, handle: common.ResposeHandler) {
    getElfHeader(vscode, program, handle);
    getProgramHeaders(vscode, program, handle);
    getSectionHeaders(vscode, program, handle);
}

