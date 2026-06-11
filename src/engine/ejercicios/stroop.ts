import type { Ejercicio } from '../types'
import { elegir, mezclar } from '../rng'

export const COLORES = [
  { nombre: 'ROJO', css: '#e5484d' },
  { nombre: 'AZUL', css: '#5172e3' },
  { nombre: 'VERDE', css: '#30a46c' },
  { nombre: 'AMARILLO', css: '#f5d90a' },
] as const

export const stroop: Ejercicio = {
  id: 'stroop',
  nombre: 'Stroop',
  descripcion: 'Toca el color de la TINTA, no lo que dice la palabra.',
  nivelMax: 10,
  generar(nivel, rng) {
    // a más nivel, más trials incongruentes
    const probIncongruente = 0.25 + nivel * 0.065
    const palabra = elegir(rng, COLORES)
    const tinta =
      rng() < probIncongruente
        ? elegir(rng, COLORES.filter((c) => c.nombre !== palabra.nombre))
        : palabra
    return {
      estimulo: { texto: palabra.nombre, color: tinta.css },
      opciones: mezclar(rng, COLORES.map((c) => c.nombre)),
      correcta: tinta.nombre,
      tiempoLimiteMs: Math.max(1500, 4000 - nivel * 250),
    }
  },
}
