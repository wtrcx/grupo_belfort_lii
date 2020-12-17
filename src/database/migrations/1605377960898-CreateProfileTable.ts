import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class CreateProfileTable1605377960898
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'profiles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'alias',
            type: 'varchar',
          },
          {
            name: 'description',
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

    await queryRunner.query(
      'INSERT INTO profiles (name, alias, description) ' +
        "VALUES('administrator','Administrador', 'Perfil com todos os acessos.')",
    );
    await queryRunner.query(
      'INSERT INTO profiles (name, alias, description) ' +
        "VALUES('profile','Perfil', 'Grupo com as funções para gerenciar os perfis.')",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('profiles');
  }
}
