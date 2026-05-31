import type { ReactNode } from "react";

function Frame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`illustration-frame ${className}`}>{children}</div>;
}

export function CommandCenterIllustration() {
  return (
    <Frame>
      <svg viewBox="0 0 560 320" role="img" aria-label="Launch control center illustration">
        <rect className="svg-shell" x="34" y="26" width="492" height="268" rx="18" />
        <rect className="svg-screen" x="68" y="58" width="424" height="204" rx="14" />
        <path className="svg-grid" d="M126 58V262 M214 58V262 M302 58V262 M390 58V262" />
        <path className="svg-grid" d="M68 108H492 M68 158H492 M68 208H492" />
        <path className="svg-flow" d="M118 206 C144 126 198 112 226 130 C258 150 276 188 314 174 C354 160 384 116 446 110" />
        <path className="svg-flow alt" d="M116 220 C150 244 196 234 232 212 C272 186 318 130 358 134 C400 138 424 160 456 198" />
        <circle className="svg-node" cx="118" cy="206" r="6" />
        <circle className="svg-node light" cx="226" cy="130" r="7" />
        <circle className="svg-node" cx="314" cy="174" r="7" />
        <circle className="svg-node light" cx="446" cy="110" r="7" />
        <circle className="svg-node" cx="456" cy="198" r="6" />
        <text className="svg-label" x="92" y="92">
          plan
        </text>
        <text className="svg-label" x="226" y="92">
          validate
        </text>
        <text className="svg-label" x="370" y="92">
          operate
        </text>
        <text className="svg-copy" x="92" y="236">
          relayer · validators · rpc · explorer
        </text>
      </svg>
    </Frame>
  );
}

export function TerminalOrbitIllustration() {
  return (
    <Frame>
      <svg viewBox="0 0 520 420" role="img" aria-label="Planning orbit illustration">
        <rect className="svg-panel" x="44" y="48" width="432" height="324" rx="20" />
        <path className="svg-ring" d="M170 210 C170 118 350 118 350 210 C350 302 170 302 170 210 Z" />
        <path className="svg-flow" d="M170 210 C170 118 350 118 350 210 C350 302 170 302 170 210 Z" />
        <circle className="svg-node light" cx="170" cy="210" r="8" />
        <circle className="svg-node" cx="260" cy="120" r="8" />
        <circle className="svg-node light" cx="350" cy="210" r="8" />
        <circle className="svg-node" cx="260" cy="300" r="8" />
        <text className="svg-label" x="212" y="214">
          control loop
        </text>
        <text className="svg-copy" x="184" y="342">
          brief → launch plan → checks
        </text>
      </svg>
    </Frame>
  );
}

export function HealthMeshIllustration() {
  return (
    <Frame>
      <svg viewBox="0 0 520 420" role="img" aria-label="Health mesh illustration">
        <rect className="svg-panel" x="44" y="48" width="432" height="324" rx="20" />
        <path className="svg-mesh" d="M112 266 L180 210 L230 240 L288 138 L352 180 L412 116" />
        <path className="svg-wave" d="M112 286 C148 264 176 244 222 252 C262 260 294 214 334 220 C366 224 392 202 412 182" />
        <circle className="svg-node" cx="180" cy="210" r="7" />
        <circle className="svg-node light" cx="288" cy="138" r="8" />
        <circle className="svg-node" cx="412" cy="116" r="8" />
        <rect className="svg-screen" x="94" y="92" width="118" height="40" rx="10" />
        <rect className="svg-screen" x="308" y="92" width="118" height="40" rx="10" />
        <text className="svg-label" x="118" y="118">
          relayer
        </text>
        <text className="svg-label" x="326" y="118">
          validators
        </text>
      </svg>
    </Frame>
  );
}

export function ControlLoopIllustration() {
  return (
    <Frame>
      <svg viewBox="0 0 520 420" role="img" aria-label="Control and recovery illustration">
        <rect className="svg-panel" x="44" y="48" width="432" height="324" rx="20" />
        <rect className="svg-screen" x="86" y="94" width="348" height="232" rx="18" />
        <path className="svg-flow" d="M132 240 C160 196 188 174 216 174 C248 174 266 220 292 220 C324 220 334 162 372 162" />
        <path className="svg-flow alt" d="M132 270 C170 284 212 284 248 252 C286 220 324 246 372 230" />
        <circle className="svg-node light" cx="216" cy="174" r="7" />
        <circle className="svg-node" cx="292" cy="220" r="7" />
        <circle className="svg-node light" cx="372" cy="162" r="7" />
        <circle className="svg-node" cx="372" cy="230" r="7" />
        <text className="svg-label" x="134" y="130">
          detect
        </text>
        <text className="svg-label" x="240" y="130">
          diagnose
        </text>
        <text className="svg-label" x="334" y="130">
          recover
        </text>
      </svg>
    </Frame>
  );
}
