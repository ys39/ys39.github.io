import Head from 'next/head';
import Image from 'next/image';

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
              src="/profile.jpg" // パスはパブリックフォルダにある画像を指します
              alt="Your Name"
              layout="fill"
              objectFit="cover"
              priority // 最初に表示されるため優先的に読み込む
            />
          </div>
          <h1 className="text-4xl font-bold mt-4">Your Name</h1>
          <p className="text-gray-700 mt-2">Web Developer | Programmer</p>
        </section>

        {/* About Me Section */}
        <section className="bg-white shadow-md rounded-lg p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-4">About Me</h2>
          <p className="text-gray-700 leading-relaxed">
            I am a passionate web developer with a love for creating interactive and visually appealing web applications.
            With a strong background in both front-end and back-end technologies, I strive to build products that provide
            users with a seamless experience.
          </p>
        </section>

        {/* Skills and achievement section */}
        <section className="bg-white shadow-md rounded-lg p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Skills</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Frontend Skills */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Frontend</h3>
              <ul className="list-none">
                <li className="bg-blue-200 text-blue-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">JavaScript</li>
                <li className="bg-green-200 text-green-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">TypeScript</li>
                <li className="bg-red-200 text-red-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">React</li>
                <li className="bg-purple-200 text-purple-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">Next.js</li>
                <li className="bg-yellow-200 text-yellow-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">Tailwind CSS</li>
              </ul>
            </div>
            {/* Backend Skills */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Backend</h3>
              <ul className="list-none">
                <li className="bg-blue-200 text-blue-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">Node.js</li>
                <li className="bg-green-200 text-green-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">Express</li>
                <li className="bg-red-200 text-red-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">MongoDB</li>
                <li className="bg-purple-200 text-purple-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">Firebase</li>
                <li className="bg-yellow-200 text-yellow-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">GraphQL</li>
              </ul>
            </div>
            {/* Tools */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Tools</h3>
              <ul className="list-none">
                <li className="bg-blue-200 text-blue-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">Git</li>
                <li className="bg-green-200 text-green-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">Docker</li>
                <li className="bg-red-200 text-red-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">Jest</li>
                <li className="bg-purple-200 text-purple-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">VS Code</li>
                <li className="bg-yellow-200 text-yellow-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">Figma</li>
              </ul>
            </div>
            {/* Database */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Database</h3>
              <ul className="list-none">
                <li className="bg-blue-200 text-blue-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">MySQL</li>
                <li className="bg-green-200 text-green-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">PostgreSQL</li>
                <li className="bg-red-200 text-red-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">SQLite</li>
                <li className="bg-purple-200 text-purple-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">Redis</li>
                <li className="bg-yellow-200 text-yellow-800 text-sm font-medium mr-2 px-4 py-2 rounded-lg mb-2">Cassandra</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Interests */}
        <section className="bg-white shadow-md rounded-lg p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Interests</h2>
          <p className="text-gray-700 leading-relaxed">
            When I am not coding, I enjoy spending time with my family, playing guitar, and hiking in the mountains.
          </p>
        </section>

        {/* Contact Section */}
        <section className="bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p className="text-gray-700 mb-4">Feel free to reach out via email or social media:</p>
          <div className="flex space-x-4">
            <a
              href="https://github.com/your-username"
              className="text-gray-600 hover:text-gray-900"
              aria-label="GitHub"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2a10 10 0 00-3.162 19.498c.5.092.682-.217.682-.482v-1.788c-2.772.603-3.36-1.332-3.36-1.332-.454-1.153-1.11-1.46-1.11-1.46-.908-.62.068-.607.068-.607 1.004.071 1.533 1.045 1.533 1.045.892 1.53 2.341 1.088 2.91.832.092-.646.35-1.088.637-1.339-2.215-.252-4.546-1.108-4.546-4.932 0-1.088.387-1.979 1.022-2.674-.103-.252-.443-1.27.097-2.645 0 0 .835-.267 2.74 1.02a9.501 9.501 0 014.986 0c1.903-1.287 2.738-1.02 2.738-1.02.542 1.375.202 2.393.1 2.645.637.695 1.02 1.586 1.02 2.674 0 3.834-2.336 4.676-4.558 4.922.359.309.679.92.679 1.854v2.75c0 .267.18.578.689.481A10 10 0 0012 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="https://linkedin.com/in/your-username"
              className="text-gray-600 hover:text-gray-900"
              aria-label="LinkedIn"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.98 3.5C4.98 2.12 6.092 1 7.48 1c1.386 0 2.5 1.12 2.5 2.5S8.867 6 7.48 6a2.5 2.5 0 01-2.5-2.5zM2 8.5V21h5V8.5H2zM9 8.5v12.5h5V14.7c0-1.44.763-2.1 1.85-2.1 1.15 0 1.65.69 1.65 2.1V21h5V13.4c0-3.46-1.85-5.1-4.3-5.1-1.9 0-2.85 1.1-3.35 1.8V8.5H9z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

