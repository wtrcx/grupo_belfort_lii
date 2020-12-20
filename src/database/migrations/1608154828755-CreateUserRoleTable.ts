import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class CreateUserProfileTable1608154828755
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_role',
        columns: [
          {
            name: 'user_id',
            isPrimary: true,
            type: 'uuid',
          },
          {
            name: 'role_id',
            isPrimary: true,
            type: 'uuid',
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
      'user_role',
      new TableForeignKey({
        name: 'user_role',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'user_role',
      new TableForeignKey({
        name: 'role_user',
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('user_role', 'role_user');
    await queryRunner.dropForeignKey('user_role', 'user_role');
    await queryRunner.dropTable('user_role');
  }
}
