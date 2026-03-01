import { hash } from 'argon2';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Ticket } from './ticket/entities/ticket.entity';
import { User } from './user/entities/user.entity';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User, Ticket],
  synchronize: true,
});

const runSeed = async () => {
  try {
    console.log(' Starting seeding...');
    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(User);

    const passwordHash = await hash('admin');

    const userData = {
      firstName: 'Admin',
      lastName: 'Admin',
      email: 'admin@admin.com',
      password: passwordHash,
    };

    const existingUser = await userRepository.findOneBy({
      email: userData.email,
    });

    if (!existingUser) {
      const newUser = userRepository.create(userData);
      await userRepository.save(newUser);
      console.log('Admin user created successfully');
    } else {
      console.log('User already exists');
    }
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('Connection closed.');
  }
};

runSeed();
