import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar')
  type: string;

  @Column('boolean', { default: false })
  status: boolean;

  @Column('int')
  priority: number;

  @ManyToOne(() => User, (user) => user.tickets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;
}
