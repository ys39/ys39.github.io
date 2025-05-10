import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

// 型定義
type SkillsType = {
  coding: string[];
  markup: string[];
  framework: string[];
  backend: string[];
  o11y: string[];
  cicd: string[];
  database: string[];
  cloud: string[];
};

type SocialMediaType = {
  name: string;
  url: string;
  icon: string;
};

export default function Home() {
  // スキルデータを整理
  const skills: SkillsType = {
    coding: [
      'JavaScript',
      'TypeScript',
      'Python',
      'PHP',
      'SQL',
      'C',
      'C++',
      'Rust',
      'Ruby',
      'Golang',
    ],
    markup: ['HTML', 'CSS'],
    framework: ['Vue', 'Svelte', 'Next.js', 'Gin', 'NestJS'],
    backend: [
      'Nginx',
      'Apache',
      'Docker / Docker Compose',
      'GraphQL',
      'REST API',
    ],
    o11y: ['Zabbix', 'Grafana', 'Fluentd', 'OpenTelemetry', 'Jaeger'],
    cicd: ['Git / GitHub Actions', 'Ansible', 'Capistrano', 'Serverspec'],
    database: ['MySQL', 'MariaDB', 'Oracle', 'Redis', 'Memcached', 'Cassandra'],
    cloud: ['AWS', 'Cloudflare'],
  };

  // 興味・関心データ
  const interests: string[] = [
    'SRE',
    'DevSecOps',
    'Architecture',
    'WebAssembly',
    'Modernization',
    'Robotics',
  ];

  // 資格データ
  const qualifications: string[] = [
    'AWS Certified Solutions Architect - Associate',
    'AWS Certified Solutions Architect - Professional',
    '基本情報技術者試験',
    'LinuC101/102',
  ];

  // ソーシャルメディアデータ
  const socialMedia: SocialMediaType[] = [
    { name: 'Zenn', url: 'https://zenn.dev/ysen', icon: 'logo-only.svg' },
    {
      name: 'GitHub',
      url: 'https://github.com/ys39',
      icon: '/github-mark.svg',
    },
    { name: 'X', url: 'https://x.com/Sypo39', icon: '/x-logo-black.png' },
  ];

  // スキルタグのレンダリング関数
  const renderSkillTag = (skill: string, colorClass: string) => (
    <span
      key={skill}
      className={`inline-block ${colorClass} text-sm font-medium px-3 py-1 rounded-lg m-1`}
    >
      {skill}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* ヒーローセクション */}
        <section className="mb-12 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-blue-100 shadow-lg">
            <Image
              src="/me_shuffle.webp"
              alt="ys39"
              priority
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Sen</h1>
            <p className="text-xl text-gray-600 mb-4">Web Developer</p>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-700 leading-relaxed">
                A web engineer with interests in infrastructure, backend
                development. Always aiming to design more robust and
                high-performance systems.
              </p>
            </div>
          </div>
        </section>

        {/* コンテンツリンクセクション */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Weblog Card */}
          <Link
            href="/weblog"
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group"
          >
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Weblog
              </h2>
              <p className="text-gray-600">
                Daily notes on learning and research
              </p>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Tech Bookmarks Card */}
          <Link
            href="/tech-bookmarks"
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group"
          >
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Tech Bookmarks
              </h2>
              <p className="text-gray-600">
                Technologies and topics for future research
              </p>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>

        {/* スキルセクション */}
        <section className="bg-white rounded-lg p-6 shadow-sm mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
            Skills
          </h2>

          <div className="space-y-6">
            {/* スキルカテゴリをマップ */}
            {Object.entries(skills).map(([category, skillList]) => (
              <div key={category} className="mb-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2 capitalize">
                  {category === 'cicd'
                    ? 'CI/CD'
                    : category === 'o11y'
                      ? 'Observability'
                      : category}
                </h3>
                <div className="flex flex-wrap">
                  {skillList.map((skill) =>
                    renderSkillTag(
                      skill,
                      category === 'coding'
                        ? 'bg-blue-50 text-blue-700'
                        : category === 'markup'
                          ? 'bg-green-50 text-green-700'
                          : category === 'framework'
                            ? 'bg-orange-50 text-orange-700'
                            : category === 'backend'
                              ? 'bg-sky-50 text-sky-700'
                              : category === 'o11y'
                                ? 'bg-teal-50 text-teal-700'
                                : category === 'cicd'
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : category === 'database'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-purple-50 text-purple-700'
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 興味・関心と資格セクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* 興味・関心 */}
          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
              Interests
            </h2>
            <div className="flex flex-wrap">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg m-1 border border-gray-200"
                >
                  {interest}
                </span>
              ))}
            </div>
          </section>

          {/* 資格 */}
          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
              Qualifications
            </h2>
            <ul className="space-y-2">
              {qualifications.map((qualification) => (
                <li
                  key={qualification}
                  className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200"
                >
                  {qualification}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ソーシャルメディアセクション */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
            Social Media
          </h2>
          <div className="flex items-center space-x-6">
            {socialMedia.map((social) => (
              <a
                key={social.name}
                href={social.url}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                aria-label={social.name}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Image
                  src={social.icon}
                  alt={social.name}
                  width={24}
                  height={24}
                />
                <span>{social.name}</span>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
