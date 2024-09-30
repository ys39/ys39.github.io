import Image from 'next/image';
import ZennLogo from './logo-only.svg';
import GithubLogo from './github-mark.svg';
import MyImage from './me.webp';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-10">
        {/* Hero Section */}
        <section className="text-center mb-10">
          <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-300">
            <Image
              src={MyImage} // パスはパブリックフォルダにある画像を指します
              alt="ys39"
              priority // 最初に表示されるため優先的に読み込む
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <h1 className="text-4xl font-bold mt-4">Sen</h1>
          <p className="text-gray-700 mt-2">Web Developer | Programmer</p>
        </section>

        {/* About Me Section */}
        <section className="bg-white shadow-md rounded-lg p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-4">About Me</h2>
          <p className="text-gray-700 leading-relaxed">
            A web engineer with interests in infrastructure, frontend, and
            backend development, but most skilled in backend development. Always
            aiming to design more robust and high-performance systems.
          </p>
        </section>

        {/* Blog section */}
        <section className="bg-white shadow-md rounded-lg p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Blog</h2>
          <div className="text-right">
            <Link
              href="/blog"
              className="text-blue-700 font-medium transition-colors duration-300"
            >
              &gt;&gt; Explore Blog
            </Link>
          </div>
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
                <li className="bg-slate-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Ruby
                </li>
              </ul>
            </div>
            {/* Markup */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Markup</h3>
              <ul className="list-none">
                <li className="bg-stone-300 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  HTML
                </li>
                <li className="bg-stone-300 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
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
            {/* Backend */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Backend</h3>
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
                  GraphQL
                </li>
                <li className="bg-sky-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  RESTful API
                </li>
              </ul>
            </div>
            {/* o11y */}
            <div>
              <h3 className="text-xl font-semibold mb-2">o11y</h3>
              <ul className="list-none">
                <li className="bg-teal-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Zabbix
                </li>
                <li className="bg-teal-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Grafana
                </li>
                <li className="bg-teal-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Fluentd
                </li>
              </ul>
            </div>
            {/* CI/CD */}
            <div>
              <h3 className="text-xl font-semibold mb-2">CI/CD</h3>
              <ul className="list-none">
                <li className="bg-indigo-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Git / GitHub Actions
                </li>
                <li className="bg-indigo-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Ansible
                </li>
                <li className="bg-indigo-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Capistrano
                </li>
                <li className="bg-indigo-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Serverspec
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
                <li className="bg-purple-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  AWS
                </li>
                <li className="bg-purple-200 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">
                  Cloudflare
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Interests */}
        <section className="bg-white shadow-md rounded-lg p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Interests</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            <li className="bg-gray-100 border  rounded-lg p-4 shadow-md">
              SRE
            </li>
            <li className="bg-gray-100 border  rounded-lg p-4 shadow-md">
              DevSecOps
            </li>
            <li className="bg-gray-100 border  rounded-lg p-4 shadow-md">
              Architecture
            </li>
            <li className="bg-gray-100 border  rounded-lg p-4 shadow-md">
              WebAssembly
            </li>
            <li className="bg-gray-100 border  rounded-lg p-4 shadow-md">
              Modernization
            </li>
          </ul>
        </section>

        {/* Qualifications */}
        <section className="bg-white shadow-md rounded-lg p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Qualifications</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            <li className="bg-gray-100 border  rounded-lg p-4 shadow-md">
              AWS Certified Solutions Architect - Associate
            </li>
            <li className="bg-gray-100 border  rounded-lg p-4 shadow-md">
              AWS Certified Solutions Architect - Professional
            </li>
            <li className="bg-gray-100 border  rounded-lg p-4 shadow-md">
              基本情報技術者試験
            </li>
            <li className="bg-gray-100 border  rounded-lg p-4 shadow-md">
              LinuC101/102
            </li>
          </ul>
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
