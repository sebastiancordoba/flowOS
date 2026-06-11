import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => localStorage.clear())

  it('muestra la pantalla de inicio con el botón de rutina', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Rutina de la mañana' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sesión libre' })).toBeInTheDocument()
  })

  it('muestra aviso cuando los datos guardados están corruptos', () => {
    localStorage.setItem('flowos-estado', '{{{corrupto')
    render(<App />)
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron leer tus datos')
  })

  it('al pulsar Rutina de la mañana entra a una sesión con bloques', async () => {
    const usuario = userEvent.setup()
    render(<App />)
    await usuario.click(screen.getByRole('button', { name: 'Rutina de la mañana' }))
    expect(screen.getByText('Bloque 1 / 4')).toBeInTheDocument()
  })

  it('navega a sesión libre y arranca un ejercicio individual', async () => {
    const usuario = userEvent.setup()
    render(<App />)
    await usuario.click(screen.getByRole('button', { name: 'Sesión libre' }))
    await usuario.click(screen.getByRole('button', { name: 'Stroop' }))
    expect(screen.getByText('Bloque 1 / 1')).toBeInTheDocument()
  })

  it('navega a estadísticas y vuelve', async () => {
    const usuario = userEvent.setup()
    render(<App />)
    await usuario.click(screen.getByRole('button', { name: 'Estadísticas' }))
    expect(screen.getByText(/Racha actual/)).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Volver' }))
    expect(screen.getByRole('button', { name: 'Rutina de la mañana' })).toBeInTheDocument()
  })
})
