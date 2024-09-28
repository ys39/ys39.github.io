import Head from 'next/head';
import Image from 'next/image';
import ZennLogo from './logo-only.svg';
import GithubLogo from './github-mark.svg';
import MyImage from './me.jpg';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>My Portfolio</title>
        <meta name="description" content="My personal portfolio" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-10">
        {/* Hero Section */}
        <section className="text-center mb-10">
          <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-300">
            <Image
              src={MyImage} // パスはパブリックフォルダにある画像を指します
              alt="ys39"
              layout="fill"
              objectFit="cover"
              priority // 最初に表示されるため優先的に読み込む
            />
          </div>
          <h1 className="text-4xl font-bold mt-4">Sen</h1>
          <p className="text-gray-700 mt-2">Web Developer | Programmer</p>
        </section>

        {/* About Me Section */}
        <section className="bg-white shadow-md rounded-lg p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-4">About Me</h2>
          <p className="text-gray-700 leading-relaxed">
            I am a passionate web developer with a love for creating interactive
            and visually appealing web applications. With a strong background in
            both front-end and back-end technologies, I strive to build products
            that provide users with a seamless experience.
          </p>
        </section>

        {/* Skills and achievement section */}
        <section className="bg-white shadow-md rounded-lg p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Skills</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Coding */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Coding</h3>
              <ul className="list-none">
                <li className="bg-slate-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  JavaScript
                </li>
                <li className="bg-slate-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  TypeScript
                </li>
                <li className="bg-slate-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Python
                </li>
                <li className="bg-slate-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  PHP
                </li>
                <li className="bg-slate-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  SQL
                </li>
                <li className="bg-slate-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  C
                </li>
                <li className="bg-slate-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  C++
                </li>
                <li className="bg-slate-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Rust
                </li>
              </ul>
            </div>
            {/* Markup */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Markup</h3>
              <ul className="list-none">
                <li className="bg-blue-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  HTML
                </li>
                <li className="bg-blue-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  CSS
                </li>
              </ul>
            </div>
            {/* Framework */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Framework</h3>
              <ul className="list-none">
                <li className="bg-orange-100 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Vue
                </li>
                <li className="bg-orange-100 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Svelte
                </li>
                <li className="bg-orange-100 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Next.js
                </li>
              </ul>
            </div>
            {/* Tools */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Tools</h3>
              <ul className="list-none">
                <li className="bg-sky-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Nginx
                </li>
                <li className="bg-sky-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Apache
                </li>
                <li className="bg-sky-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Docker / Docker Compose
                </li>
                <li className="bg-sky-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Zabbix
                </li>
                <li className="bg-sky-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Grafana
                </li>
                <li className="bg-sky-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Git / GitHub Actions
                </li>
                <li className="bg-sky-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Fluentd
                </li>
              </ul>
            </div>
            {/* Database */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Database</h3>
              <ul className="list-none">
                <li className="bg-rose-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  MySQL
                </li>
                <li className="bg-rose-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  MariaDB
                </li>
                <li className="bg-rose-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Oracle
                </li>
                <li className="bg-rose-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Redis
                </li>
                <li className="bg-rose-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Memcached
                </li>
              </ul>
            </div>
            {/* Cloud */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Cloud</h3>
              <ul className="list-none">
                <li className="bg-green-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  AWS
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Interests */}
        <section className="bg-white shadow-md rounded-lg p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Interests</h2>
          <p className="text-gray-700 leading-relaxed">
            When I am not coding, I enjoy spending time with my family, playing
            guitar, and hiking in the mountains.
          </p>
        </section>

        {/* Contact Section */}

        <section className="bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Social Media</h2>
          <div className="flex items-center space-x-4">
            {/* Zenn */}
            <a
              href="https://zenn.dev/ysen"
              className="text-gray-600 hover:text-gray-900"
              aria-label="Zenn"
              target="_blank"
              rel="noreferrer noopener"
            >
              <ZennLogo className="w-6 h-6" />
            </a>
            {/* Github */}
            <a
              href="https://github.com/ys39"
              className="text-gray-600 hover:text-gray-900"
              aria-label="GitHub"
              target="_blank"
              rel="noreferrer noopener"
            >
              <GithubLogo className="w-6 h-6" />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
