import { createContext, useContext } from 'react'

export const AppContext = createContext(null)
export const useAppCtx = () => useContext(AppContext)
