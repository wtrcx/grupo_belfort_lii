import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import Intent from './Intent';
import User from './User';

@Entity('utterances')
class Utterance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  utterance: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Intent)
  @JoinColumn({ name: 'intent_id' })
  intent: Intent;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Utterance;
