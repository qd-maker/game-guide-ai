"use client"

import { useEffect } from 'react'

/**
 * Development helper: convert the specific React controlled/uncontrolled warning
 * into a thrown Error so the browser shows a proper stack trace and makes it
 * easier to locate the offending component.
 *
 * This file is intentionally small and only mounted in development.
 */
export default function ReactWarningHelper() {
    useEffect(() => {
        const orig = console.error.bind(console)

        console.error = (...args: any[]) => {
            try {
                const first = args[0]
                if (
                    typeof first === 'string' &&
                    first.includes("You provided a `value` prop to a form field without an `onChange` handler")
                ) {
                    // Throw so the browser prints a full stack trace and we can see the origin.
                    throw new Error(first)
                }
            } catch (e) {
                // swallow intentionally after rethrowing to not break console flow
            } finally {
                orig(...args)
            }
        }

        return () => {
            console.error = orig
        }
    }, [])

    return null
}
