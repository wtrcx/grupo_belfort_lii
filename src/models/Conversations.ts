import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import Client from './Client';
import Collaborators from './Collaborators';
import Historic from './Historic';

@Entity('conversations')
class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => Collaborators)
  @JoinColumn({ name: 'collaborator_id' })
  collaborator: Collaborators;

  @OneToMany(() => Historic, historic => historic.conversation)
  historic: Historic[];

  @Column()
  access: string;

  @Column()
  name?: string;

  @Column()
  close: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Conversation;
