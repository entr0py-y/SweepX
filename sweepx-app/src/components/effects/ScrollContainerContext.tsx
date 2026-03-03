import { createContext, useContext, RefObject } from 'react'

export const ScrollContainerContext = createContext<RefObject<HTMLDivElement> | null>(null)

export const useScrollContainer = () => useContext(ScrollContainerContext)
