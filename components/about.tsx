export function About() {
  return (
    <section id="about" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24" aria-label="About me">
      <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-background/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">About</h2>
      </div>
      <div className="text-muted-foreground">
        <p className="mb-4">
          Back in 2012, I decided to try my hand at creating custom Tumblr themes and tumbled head first into the rabbit
          hole of coding and web development. Fast-forward to today, and I’ve had the privilege of building software for
          an <span className="font-medium text-slate-200">advertising agency</span>, a{" "}
          <span className="font-medium text-slate-200">start-up</span>, a{" "}
          <span className="font-medium text-slate-200">huge corporation</span>, and a{" "}
          <span className="font-medium text-slate-200">digital product studio</span>.
        </p>
        <p className="mb-4">
          My main focus these days is building accessible, inclusive products and digital experiences at{" "}
          <span className="font-medium text-slate-200">Upstatement</span> for a variety of clients.
        </p>
        <p>
          When I’m not at the computer, I’m usually hanging out with my wife and two cats, reading, or running around
          Hyrule searching for <span className="font-medium text-slate-200">Korok seeds</span>.
        </p>
      </div>
    </section>
  )
}
