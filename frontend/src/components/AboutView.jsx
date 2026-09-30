function AboutView() {
  return (
    <div>
      <h2>About NyxBreach</h2>
      <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>
        Not One Breach — Three Silent Steps You Never See Coming.
      </p>

      <h3>Our Mission</h3>
      <p>
        Most cyberattacks succeed not because they're undetectable, but because their early warning
        signs are scattered across disconnected tools, or hidden inside cloud services that require
        trusting a third party with your most sensitive data. NyxBreach exists to close that gap —
        detecting the three silent pre-breach stages of a modern attack, entirely on your own device.
      </p>

      <h3>Our Vision</h3>
      <p>
        A world where powerful security intelligence doesn't require sacrificing privacy — where
        on-device AI, accelerated by hardware like the Snapdragon NPU, makes enterprise-grade
        threat detection accessible to individuals and small teams alike, without their data ever
        leaving their machine.
      </p>

      <h3>How It Works</h3>
      <p>NyxBreach watches for three early-warning signals that typically precede a full breach:</p>
      <ul>
        <li><strong>Credential Exposure</strong> — checks if your passwords have appeared in known public data breaches, using privacy-preserving k-anonymity (your real password never leaves your device).</li>
        <li><strong>Session Hijacking</strong> — detects "impossible travel" patterns, where a login token is used from two different locations in a suspiciously short time.</li>
        <li><strong>Ransomware Staging</strong> — identifies the rapid file-renaming behavior that typically precedes ransomware encryption.</li>
      </ul>
      <p>
        Every alert is explained in plain language by an on-device AI co-pilot, and comes with a
        clear recommended action — no jargon, no guesswork.
      </p>

      <h3>Privacy by Design</h3>
      <p>
        Your credentials, session data, file activity, and conversations with the AI co-pilot never
        leave your device. There are no cloud servers involved in NyxBreach's core detection or AI
        reasoning — everything runs locally.
      </p>

      <h3>Built For</h3>
      <p>
        The Snapdragon® AI Lab Build & Present Challenge, optimized for Snapdragon-powered HP PCs,
        using on-device AI models intended for deployment via Qualcomm AI Hub.
      </p>

      <h3>Version</h3>
      <p>NyxBreach v1.0.0</p>
    </div>
  )
}

export default AboutView