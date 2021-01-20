import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class CreateRolesTable1608154828754
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'roles',
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
            name: 'profile_id',
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
      'roles',
      new TableForeignKey({
        name: 'profile_role',
        columnNames: ['profile_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'profiles',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.query(
      'INSERT INTO roles (name, alias, description, profile_id) ' +
        "VALUES('administrator','Administrador', 'Papel com todos os acessos.'," +
        "(SELECT id FROM profiles WHERE name='administrator'))",
    );

    await queryRunner.query(
      'INSERT INTO roles (name, alias, description, profile_id) ' +
        "VALUES('profile_consult','Consultar Perfil', 'Consultar todos os perfis.'," +
        "(SELECT id FROM profiles WHERE name='access'))",
    );

    await queryRunner.query(
      'INSERT INTO roles (name, alias, description, profile_id) ' +
        "VALUES('access_consult','Consultar Acessos', 'Consultar todos os usuários cadastrados.'," +
        "(SELECT id FROM profiles WHERE name='access'))",
    );

    await queryRunner.query(
      'INSERT INTO roles (name, alias, description, profile_id) ' +
        "VALUES('access_create','Criar Usuários', 'Criar novos usuários na aplicação.'," +
        "(SELECT id FROM profiles WHERE name='access'))",
    );

    await queryRunner.query(
      'INSERT INTO roles (name, alias, description, profile_id) ' +
        "VALUES('whatsapp_create','Novo Whatsapp', 'Criar novas conexões com o Whatsapp.'," +
        "(SELECT id FROM profiles WHERE name='whatsapp'))",
    );

    await queryRunner.query(
      'INSERT INTO roles (name, alias, description, profile_id) ' +
        "VALUES('conversation_consult','Consultar Conversas', 'Criar novas conexões com o Whatsapp.'," +
        "(SELECT id FROM profiles WHERE name='conversation'))",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('roles', 'profile_role');
    await queryRunner.dropTable('roles');
  }
}
