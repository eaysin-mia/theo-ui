export default function Page() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <div className="flex flex-col items-center gap-2 py-8 md:py-16 lg:py-20 xl:gap-4">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance text-primary lg:leading-[1.1] xl:text-5xl xl:tracking-tighter">
          Build your own docs with the power of Next.js &amp; React
        </h1>
        <p className="max-w-3xl text-base text-balance text-foreground sm:text-lg">
          A flexible docs foundation built with shadcn/ui. Customize it, extend
          it, and make it your own.
        </p>
      </div>
    </section>
  );
}
