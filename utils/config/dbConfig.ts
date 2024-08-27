import mongoose from 'mongoose';

export async function connect() {
  try {
    mongoose.connect(process.env.DATABASE_URL!);

    mongoose.connection.on('connected', () => {
      console.log('🚀 ~ connect ~ connected');
    });

    mongoose.connection.on('error', (error) => {
      console.log('🚀 ~ connect ~ error:', error);
      process.exit();
    });
  } catch (error) {
    console.log('🚀 ~ connect ~ error:', error);
  }
}
