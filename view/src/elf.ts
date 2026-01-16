

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
    Align: number
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






