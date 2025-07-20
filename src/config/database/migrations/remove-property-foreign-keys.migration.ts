import { Migration } from '@mikro-orm/migrations';

export class Migration20250720041300 extends Migration {
  async up(): Promise<void> {
    // Drop foreign key constraints if they exist
    this.addSql(
      'ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "properties_project_id_fkey";',
    );
    this.addSql(
      'ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "properties_property_type_id_fkey";',
    );
  }

  async down(): Promise<void> {
    // Re-add foreign key constraints (if needed in the future)
    // this.addSql('ALTER TABLE "properties" ADD CONSTRAINT "properties_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");');
    // this.addSql('ALTER TABLE "properties" ADD CONSTRAINT "properties_property_type_id_fkey" FOREIGN KEY ("property_type_id") REFERENCES "property_types"("id");');
  }
}
