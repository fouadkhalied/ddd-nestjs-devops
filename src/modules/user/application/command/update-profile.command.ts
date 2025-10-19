export class UpdateProfileCommand {
    constructor(
      public readonly userId: string,
      public readonly username?: string,
      public readonly password?: string,
      public readonly country?: string,
    ) {}
  }