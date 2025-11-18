import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserRole {
  OPERATOR = 'operator',
  USER = 'user',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { name: 'first_name' })
  firstName: string;

  @Column('varchar', { name: 'second_name' })
  lastName: string;

  @Column('varchar', { unique: true })
  email: string;

  @Column('varchar')
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
