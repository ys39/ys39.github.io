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
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-6 py-20 max-w-4xl">
        <Breadcrumb items={breadcrumbItems} />

        <h1 className="text-4xl font-light text-gray-900 mb-4 text-center">
          Tech Bookmarks
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          I will document the technologies and topics planned for future
          research.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          {terms.map((term) => (
            <div key={term.title} className="group">
              {term.link && term.link.length > 0 ? (
                <Link
                  href={term.link}
                  className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm border border-blue-200 transition-colors"
                  target="_blank"
                  referrerPolicy="no-referrer"
                >
                  {term.title}
                  <FaExternalLinkAlt size={12} />
                </Link>
              ) : (
                <span className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm">
                  {term.title}
                </span>
              )}
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
