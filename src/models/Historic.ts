import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import Conversations from './Conversations';

@Entity('historic')
export default class Historic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Conversations)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversations;

  @Column()
  sequence: number;

  @Column()
  request: string;

  @Column()
  response: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
