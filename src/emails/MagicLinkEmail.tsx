import React from 'react'

interface MagicLinkEmailProps {
  name?: string
  magicLink: string
  expiresIn?: number
}

export const MagicLinkEmail: React.FC<MagicLinkEmailProps> = ({
  name = 'Usuário',
  magicLink,
  expiresIn = 20
}) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px',
        textAlign: 'center',
        borderRadius: '8px 8px 0 0'
      }}>
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
          Kadernim
        </h1>
        <p style={{ color: '#e0e7ff', margin: '8px 0 0 0', fontSize: '14px' }}>
          Plataforma de Gerenciamento Educacional
        </p>
      </div>

      {/* Body */}
      <div style={{
        background: '#ffffff',
        padding: '40px 30px',
        borderRadius: '0 0 8px 8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {/* Greeting */}
        <p style={{
          fontSize: '16px',
          color: '#1f2937',
          margin: '0 0 24px 0',
          lineHeight: '1.6'
        }}>
          Olá <strong>{name}</strong>,
        </p>

        {/* Main Message */}
        <p style={{
          fontSize: '16px',
          color: '#1f2937',
          margin: '0 0 24px 0',
          lineHeight: '1.6'
        }}>
          Você solicitou um link de acesso para sua conta no Kadernim. Clique no botão abaixo para acessar sua conta:
        </p>

        {/* CTA Button */}
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <a
            href={magicLink}
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              padding: '14px 40px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: 'opacity 0.3s ease'
            }}
          >
            🔐 Acessar Minha Conta
          </a>
        </div>

        {/* Alternative Link */}
        <p style={{
          fontSize: '13px',
          color: '#6b7280',
          margin: '24px 0',
          textAlign: 'center',
          wordBreak: 'break-all'
        }}>
          Ou copie e cole este link no seu navegador:<br />
          <span style={{ color: '#667eea', fontWeight: 'bold' }}>{magicLink}</span>
        </p>

        {/* Expiration Notice */}
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '6px',
          padding: '16px',
          margin: '24px 0',
          fontSize: '14px',
          color: '#92400e'
        }}>
          <strong>⏰ Atenção:</strong> Este link expira em <strong>{expiresIn} minutos</strong>. Se você não solicitou este email, ignore-o.
        </div>

        {/* Security Notice */}
        <p style={{
          fontSize: '13px',
          color: '#6b7280',
          margin: '24px 0',
          lineHeight: '1.6'
        }}>
          🔒 <strong>Segurança:</strong> Nunca compartilhe este link com outras pessoas. A Kadernim nunca pedirá sua senha por email.
        </p>

        {/* Divider */}
        <hr style={{
          border: 'none',
          borderTop: '1px solid #e5e7eb',
          margin: '32px 0'
        }} />

        {/* Footer */}
        <div style={{
          fontSize: '12px',
          color: '#9ca3af',
          textAlign: 'center',
          lineHeight: '1.6'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            © 2025 Kadernim. Todos os direitos reservados.
          </p>
          <p style={{ margin: '0' }}>
            Este é um email automático. Por favor, não responda.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MagicLinkEmail
