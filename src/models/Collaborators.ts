import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('collaborators')
class Collaborator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company: number;

  @Column()
  re: number;

  @Column()
  name: string;

  @Column()
  cell_phone: string;

  @Column()
  email: string;

  @Column()
  is_enable: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Collaborator;
