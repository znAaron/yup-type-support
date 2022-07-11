import type { NodeVisitorContext } from '@znaaron/simple-ts-transform'
import type { NodeFactory, Program, SourceFile, TransformationContext } from 'typescript'

export type InterfaceEntry = {
  name: string;
  //todo: change this to enum
  type: "number" | "string";
  optional: boolean;
}

export type InterfaceDetail = {
  name: string;
  entries: InterfaceEntry[];
  tmp: InterfaceEntry;
}

export default class YtContext implements NodeVisitorContext {
  public readonly basePath: string
  public factory!: NodeFactory
  public fileName!: string

  // DFA version 1 (0 - 8)
  public DFAState!: number
  public currInterface!: InterfaceDetail

  public constructor(program: Program, public readonly _configuration: unknown) {
    this.basePath = program.getCompilerOptions().rootDir || program.getCurrentDirectory()
  }

  public initNewFile(context: TransformationContext, sourceFile: SourceFile): void {
    this.factory = context.factory
    this.fileName = sourceFile.fileName

    this.DFAState = 0
    this.currInterface = {
      name: "",
      entries: [],
      tmp: {
        name: "",
        type: "string",
        optional: false
      }
    }
  }
} 