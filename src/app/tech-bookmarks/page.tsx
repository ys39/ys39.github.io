import { termsList } from '../../../tech-bookmarks/terms';
import { TermsData } from '../types/terms';
import Breadcrumb from '../../components/breadcrumb';
import Link from 'next/link';
import { FaExternalLinkAlt } from 'react-icons/fa';

export default function WeblogPage() {
  const terms = getTerms();
  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Tech Bookmarks' },
  ];
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-10">
        <Breadcrumb items={breadcrumbItems} />

        <h1 className="text-4xl text-center font-bold mb-4 dark:text-gray-700">
          Tech Bookmarks
        </h1>
        <div className="text-center text-gray-600 mb-6">
          I will document the technologies and topics planned for future
          research.
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {terms.map((term) => (
            <div
              key={term.title}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-base font-semibold mb-2 text-gray-800">
                  {term.title}
                </h2>
                {term.link && term.link.length > 0 && (
                  <div className="mt-4">
                    <Link
                      href={`${term.link}`}
                      className="text-blue-700 hover:text-blue-700 font-medium float-end flex items-center pb-2"
                      target="_blank"
                      referrerPolicy="no-referrer"
                    >
                      Link <FaExternalLinkAlt className="float-end ml-2" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function getTerms(): TermsData[] {
  // terms.ts から取得する
  const terms = termsList.map((term) => {
    return {
      title: term.title,
      date: term.date,
      link: term.link,
    };
  });
  return terms;
}
