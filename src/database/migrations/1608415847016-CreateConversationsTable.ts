import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class CreateConversationsTable1608415847016
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'conversations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'client_id',
            type: 'uuid',
          },
          {
            name: 'collaborator_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'access',
            type: 'varchar',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'conversations',
      new TableForeignKey({
        name: 'client_conversation',
        columnNames: ['client_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'clients',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'conversations',
      new TableForeignKey({
        name: 'collaborator_conversation',
        columnNames: ['collaborator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'collaborators',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('conversations', 'client_conversation');
    await queryRunner.dropForeignKey(
      'conversations',
      'collaborator_conversation',
    );
    await queryRunner.dropTable('conversations');
  }
}
