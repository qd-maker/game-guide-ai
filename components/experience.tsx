import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const jobs = [
  {
    company: "Vercel",
    title: "Senior Frontend Engineer",
    start: "2024",
    end: "Present",
    description:
      "Build and maintain critical components used to construct Vercel's frontend, across the whole product. Work closely with cross-functional teams, including developers, designers, and product managers, to implement and advocate for best practices in web accessibility.",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Figma"],
    link: "https://vercel.com",
  },
  {
    company: "Shopify",
    title: "Frontend Engineer",
    start: "2021",
    end: "2024",
    description:
      "Developed and maintained code for in-house and client websites primarily using HTML, CSS, Sass, JavaScript, and jQuery. Manually tested sites in various browsers and mobile devices to ensure cross-browser compatibility and responsiveness.",
    skills: ["JavaScript", "React", "Polaris", "Ruby on Rails"],
    link: "https://shopify.com",
  },
  {
    company: "Apple",
    title: "UI Engineer Co-op",
    start: "2020",
    end: "2021",
    description:
      "Collaborated with designers and engineers to build and maintain internal tools for the Apple Media Products team. Implemented new features and fixed bugs in existing applications.",
    skills: ["Ember", "JavaScript", "SCSS"],
    link: "https://apple.com",
  },
]

export function Experience() {
  return (
    <section
      id="experience"
      className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24"
      aria-label="Work experience"
    >
      <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-background/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">Experience</h2>
      </div>
      <div>
        <ol className="group/list">
          {jobs.map((job, index) => (
            <li key={index} className="mb-12">
              <div className="group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
                <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>
                <header
                  className="z-10 mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2"
                  aria-label={`${job.start} to ${job.end}`}
                >
                  {job.start} — {job.end}
                </header>
                <div className="z-10 sm:col-span-6">
                  <h3 className="font-medium leading-snug text-slate-200">
                    <div>
                      <a
                        className="inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-primary focus-visible:text-primary group/link text-base"
                        href={job.link}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`${job.title} at ${job.company} (opens in a new tab)`}
                      >
                        <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"></span>
                        <span>
                          {job.title} · <span className="inline-block">{job.company}</span>
                        </span>
                      </a>
                    </div>
                  </h3>
                  <p className="mt-2 text-sm leading-normal text-muted-foreground">{job.description}</p>
                  <ul className="mt-2 flex flex-wrap" aria-label="Technologies used">
                    {job.skills.map((skill) => (
                      <li key={skill} className="mr-1.5 mt-2">
                        <Badge variant="secondary" className="text-primary bg-primary/10 hover:bg-primary/20 border-0">
                          {skill}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
