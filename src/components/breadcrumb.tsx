import Link from 'next/link';

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="text-gray-700 text-lg mb-8" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {item.href ? (
              <Link href={item.href} className="text-blue-700 hover:nounderline">
                {item.name}
              </Link>
            ) : (
              <span className="text-gray-700">{item.name}</span>
            )}
            {index < items.length - 1 && (
              <span className="mx-2 text-gray-700">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
