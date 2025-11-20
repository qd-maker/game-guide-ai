import Image from "next/image"
import { Badge } from "@/components/ui/badge"

const projects = [
  {
    title: "Build a Spotify Connected App",
    description:
      "Video course that teaches how to build a web app with the Spotify Web API. Topics covered include the principles of REST APIs, user auth flows, Node, Express, React, Styled Components, and more.",
    image: "/spotify-app-interface.png",
    link: "https://spotify.com",
    skills: ["React", "Express", "Spotify API", "Styled Components"],
    stats: "10k+ Students",
  },
  {
    title: "Spotify Profile",
    description:
      "Web app for visualizing personalized Spotify data. View your top artists, top tracks, recently played tracks, and detailed audio information of each track. Create and save new playlists of recommended tracks based on your existing playlists and more.",
    image: "/music-dashboard.jpg",
    link: "https://spotify.com",
    skills: ["React", "Styled Components", "Chart.js", "Express"],
    stats: "500+ Stars",
  },
  {
    title: "Halcyon Theme",
    description:
      "A minimal, dark blue theme for VS Code, Sublime Text, Atom, iTerm, and more. Available on Visual Studio Marketplace, Package Control, Atom Package Manager, and npm.",
    image: "/code-editor-theme.jpg",
    link: "https://vscode.com",
    skills: ["VS Code", "Sublime Text", "Atom", "iTerm2"],
    stats: "200k+ Installs",
  },
]

export function Projects() {
  return (
    <section id="projects" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24" aria-label="Selected projects">
      <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-background/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">Projects</h2>
      </div>
      <div>
        <ul className="group/list">
          {projects.map((project, index) => (
            <li key={index} className="mb-12">
              <div className="group relative grid gap-4 pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
                <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>
                <div className="z-10 sm:order-2 sm:col-span-6">
                  <h3>
                    <a
                      className="inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-primary focus-visible:text-primary group/link text-base"
                      href={project.link}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`${project.title} (opens in a new tab)`}
                    >
                      <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"></span>
                      <span>{project.title}</span>
                    </a>
                  </h3>
                  <p className="mt-2 text-sm leading-normal text-muted-foreground">{project.description}</p>
                  <ul className="mt-2 flex flex-wrap" aria-label="Technologies used">
                    {project.skills.map((skill) => (
                      <li key={skill} className="mr-1.5 mt-2">
                        <Badge variant="secondary" className="text-primary bg-primary/10 hover:bg-primary/20 border-0">
                          {skill}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="z-10 sm:order-1 sm:col-span-2">
                  <Image
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    width={200}
                    height={125}
                    className="rounded border-2 border-slate-200/10 transition group-hover:border-slate-200/30 sm:order-1 sm:col-span-2 sm:translate-y-1"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
