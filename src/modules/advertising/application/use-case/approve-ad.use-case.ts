import { Injectable } from '@nestjs/common';

@Injectable()
export class ApproveAdUseCase {
  async execute(id: string, approver?: string) {
    // Minimal placeholder - real work is handled by handlers/repo
    // Keeping for DI compatibility with module
    return { ok: true, id, approver };
  }
}
