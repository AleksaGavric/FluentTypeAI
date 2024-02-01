import Link from 'next/link';

export default function FourOhFour() {
  return (
    <div className="flex flex-col items-center h-screen justify-center">
      <div className="space-x-2 pb-8 pt-6 md:space-y-5">
        <h1 className="text-6xl font-extrabold leading-9 tracking-tight text-black  md:border-r-2 md:px-6">
          Error 404
        </h1>
      </div>
      <div className="max-w-md text-center">
        <p className="mb-4 text-xl font-bold leading-normal md:text-2xl">
          Sorry we couldn&apos;t find this page.
        </p>
        <p className="mb-8">
          Maybe you got the wrong URL... well anyways, you can always go back to
          the homepage!
        </p>
        <Link
          href="/"
          className="rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium leading-5 text-white shadow transition-colors duration-150 hover:bg-blue-700 focus:outline-none dark:hover:bg-blue-500"
        >
          Homepage
        </Link>
      </div>
    </div>
  );
}
