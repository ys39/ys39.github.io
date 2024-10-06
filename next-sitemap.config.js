/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://itsme.senriy.dev',
  generateRobotsTxt: true,
  outDir: './out', // export のディレクトリ
};
