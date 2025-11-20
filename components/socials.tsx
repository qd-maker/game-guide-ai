import { Github, Linkedin, Mail, Twitter } from 'lucide-react'

export function Socials() {
  return (
    <ul className="ml-1 mt-8 flex items-center" aria-label="Social media">
      <li className="mr-5 text-xs">
        <a
          className="block hover:text-slate-200"
          href="https://github.com"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="GitHub (opens in a new tab)"
        >
          <span className="sr-only">GitHub</span>
          <Github className="h-6 w-6" />
        </a>
      </li>
      <li className="mr-5 text-xs">
        <a
          className="block hover:text-slate-200"
          href="https://linkedin.com"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="LinkedIn (opens in a new tab)"
        >
          <span className="sr-only">LinkedIn</span>
          <Linkedin className="h-6 w-6" />
        </a>
      </li>
      <li className="mr-5 text-xs">
        <a
          className="block hover:text-slate-200"
          href="https://twitter.com"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Twitter (opens in a new tab)"
        >
          <span className="sr-only">Twitter</span>
          <Twitter className="h-6 w-6" />
        </a>
      </li>
      <li className="mr-5 text-xs">
        <a
          className="block hover:text-slate-200"
          href="mailto:hello@example.com"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Email (opens in a new tab)"
        >
          <span className="sr-only">Email</span>
          <Mail className="h-6 w-6" />
        </a>
      </li>
    </ul>
  )
}
