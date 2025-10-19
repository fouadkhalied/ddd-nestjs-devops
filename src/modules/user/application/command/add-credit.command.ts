export class AddCreditCommand {
    constructor(
      public readonly adminId: string,
      public readonly userId: string,
      public readonly credit: number,
    ) {}
  }