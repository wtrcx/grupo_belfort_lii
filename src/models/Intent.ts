import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import Utterance from './Utterance';
import User from './User';
import Answer from './Answer';

@Entity('intents')
class Intent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  script: string;

  @Column()
  name: string;

  @Column()
  is_enable: boolean;

  @OneToMany(() => Utterance, utterance => utterance.intent)
  utterances: Utterance[];

  @OneToMany(() => Answer, answer => answer.intent)
  answers: Answer[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Intent;
