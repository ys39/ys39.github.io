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
  const renderSkillTag = (skill: string) => (
    <span
      key={skill}
      className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-2 rounded-full mx-1 mb-2"
    >
      {skill}
    </span>
  );

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-6 py-20 max-w-3xl">
        {/* ヒーローセクション */}
        <section className="mb-24 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto md:mx-0">
            <Image
              src="/me_shuffle.webp"
              alt="ys39"
              priority
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="md:col-span-2">
            <h1 className="text-4xl font-light text-gray-900 mb-1">Sen</h1>
            <p className="text-lg text-gray-500 mb-4">Web Developer</p>
            <p className="text-gray-600 leading-relaxed">
              A web engineer with interests in infrastructure, backend
              development. Always aiming to design more robust and
              high-performance systems.
            </p>
          </div>
        </section>

        {/* コンテンツリンクセクション */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
          {/* Weblog Card */}
          <Link
            href="/weblog"
            className="border border-gray-200 rounded-xl p-8 hover:border-gray-300 transition-colors flex justify-between items-center group"
          >
            <div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Weblog</h2>
              <p className="text-gray-500">
                Daily notes on learning and research
              </p>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Tech Bookmarks Card */}
          <Link
            href="/tech-bookmarks"
            className="border border-gray-200 rounded-xl p-8 hover:border-gray-300 transition-colors flex justify-between items-center group"
          >
            <div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">
                Tech Bookmarks
              </h2>
              <p className="text-gray-500">
                Technologies and topics for future research
              </p>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>

        {/* スキルセクション */}
        <section className="mb-20">
          <h2 className="text-2xl font-light text-gray-900 mb-8">Skills</h2>

          <div className="space-y-8">
            {/* スキルカテゴリをマップ */}
            {Object.entries(skills).map(([category, skillList]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                  {category === 'cicd'
                    ? 'CI/CD'
                    : category === 'o11y'
                      ? 'Observability'
                      : category}
                </h3>
                <div className="flex flex-wrap">
                  {skillList.map((skill) => renderSkillTag(skill))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 興味・関心と資格セクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          {/* 興味・関心 */}
          <section>
            <h2 className="text-2xl font-light text-gray-900 mb-6">
              Interests
            </h2>
            <div className="flex flex-wrap">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-full mx-1 mb-2 text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </section>

          {/* 資格 */}
          <section>
            <h2 className="text-2xl font-light text-gray-900 mb-6">
              Qualifications
            </h2>
            <ul className="space-y-3">
              {qualifications.map((qualification) => (
                <li key={qualification} className="text-gray-600 text-sm">
                  {qualification}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ソーシャルメディアセクション */}
        <section>
          <h2 className="text-2xl font-light text-gray-900 mb-6">
            Social Media
          </h2>
          <div className="flex items-center space-x-8">
            {socialMedia.map((social) => (
              <a
                key={social.name}
                href={social.url}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors"
                aria-label={social.name}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Image
                  src={social.icon}
                  alt={social.name}
                  width={20}
                  height={20}
                />
                <span className="text-sm">{social.name}</span>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
