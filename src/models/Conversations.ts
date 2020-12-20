import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import Client from './Client';
import Collaborators from './Collaborators';

@Entity('conversations')
export default class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  collaborator_id: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => Collaborators)
  @JoinColumn({ name: 'collaborator_id' })
  collaborator: Collaborators;

  @Column()
  access: string;

  @Column()
  name: string;

  @Column()
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
