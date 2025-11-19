export default () => ({
  database: {
    type: 'mysql',
    database: process.env.MYSQL_DATABASE,
    synchronize: true,
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || null,
    username: process.env.MYSQL_USER || null,
    password: process.env.MYSQL_PASSWORD || null,
    entities: ['dist/**/*.entity{.ts,.js}'],
  },
});
