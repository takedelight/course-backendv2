import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum StatementStatus {
  PENDING = 'В обробці',
  SUCCESS = 'Виконано',
  REJECT = 'Відхилено',
}

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar')
  type: string;

  @Column({
    default: StatementStatus.PENDING,
    enum: StatementStatus,
    name: 'status',
  })
  status: StatementStatus;

  @ManyToOne(() => User, (user) => user.tickets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'timestamp with time zone',
    name: 'completed_at',
    nullable: true,
  })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;
}
