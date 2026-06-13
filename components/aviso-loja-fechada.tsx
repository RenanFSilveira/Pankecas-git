"use client"

import { useEffect, useState } from "react"

/**
 * AVISO TEMPORÁRIO — LOJA FECHADA (13/06/2026)
 *
 * Este aviso aparece para TODOS os visitantes somente HOJE.
 * Ele se DESFAZ SOZINHO: depois do instante `EXPIRA_EM` o componente
 * não renderiza mais nada — não é preciso novo deploy para remover.
 *
 * `EXPIRA_EM` = fim do dia 13/06/2026 no horário de Brasília (UTC-3),
 * ou seja, 14/06/2026 00:00 em São Paulo = 14/06/2026 03:00 UTC.
 *
 * Pode apagar este arquivo e a importação no layout quando quiser.
 */
const EXPIRA_EM = Date.parse("2026-06-14T03:00:00Z")

export function AvisoLojaFechada() {
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    setVisivel(Date.now() < EXPIRA_EM)
  }, [])

  if (!visivel) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Aviso: loja fechada hoje"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          width: "100%",
          background: "#ffffff",
          borderRadius: "1rem",
          padding: "2rem 1.5rem",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          border: "4px solid #dc2626",
        }}
      >
        <div style={{ fontSize: "3rem", lineHeight: 1, marginBottom: "0.75rem" }}>🚫</div>
        <h2
          style={{
            margin: 0,
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "#dc2626",
          }}
        >
          Hoje estamos fechados
        </h2>
        <p
          style={{
            margin: "0.75rem 0 0",
            fontSize: "1.05rem",
            color: "#1f2937",
            lineHeight: 1.5,
          }}
        >
          Não estamos funcionando hoje. <br />
          <strong>Voltamos amanhã às 18h!</strong>
        </p>
        <p style={{ margin: "1rem 0 0", fontSize: "0.95rem", color: "#4b5563" }}>
          Agradecemos a compreensão e esperamos você. 💛
        </p>
        <button
          type="button"
          onClick={() => setVisivel(false)}
          style={{
            marginTop: "1.5rem",
            width: "100%",
            padding: "0.75rem 1rem",
            fontSize: "1rem",
            fontWeight: 700,
            color: "#ffffff",
            background: "#dc2626",
            border: "none",
            borderRadius: "0.625rem",
            cursor: "pointer",
          }}
        >
          Entendi, ver o cardápio
        </button>
      </div>
    </div>
  )
}
