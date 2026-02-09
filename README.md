# Tour: Pagos en Stellar sin smart contracts

**Objetivo de esta clase:** Recorrer la app de pagos en Stellar Testnet y dejar claro que **para enviar y recibir pagos (XLM o tokens) no hace falta programar ni desplegar smart contracts**. Basta con cuentas, operaciones clásicas y la API de Horizon.

---

## Idea central

En Stellar puedes hacer **pagos simples** (enviar XLM o activos a otra dirección) usando solo:

- **Cuentas** (par de llaves pública/privada)
- **Operaciones** (payment, etc.)
- **Horizon** (API REST que lee el ledger y envía transacciones)

Todo eso existe en la **red clásica de Stellar**. Los **smart contracts** (Soroban) son otra capa para lógica más compleja; para “mandar dinero de A a B” no los necesitas.

---

## Qué hay en este repo

Una app web mínima (Next.js 14) que:

1. Conecta una wallet Stellar (Freighter, xBull, etc.) en **Testnet**
2. Muestra la **clave pública** y el **balance en XLM**
3. Permite **enviar un pago en XLM** a otra dirección
4. Muestra las **últimas transacciones** de la cuenta

Nada de esto usa Soroban ni contratos; solo SDK clásico + Horizon + Wallets Kit.

---

## Stack en una frase

| Capa | Qué usamos |
|------|------------|
| Red | Stellar **Testnet** (red clásica) |
| API | **Horizon** (`horizon-testnet.stellar.org`) |
| SDK | `@stellar/stellar-sdk` (transacciones, operaciones, Horizon) |
| Wallet | `@creit.tech/stellar-wallets-kit` (conectar Freighter, xBull, etc.) |
| App | Next.js 14 (App Router), React, Tailwind |

---

## Tour por la estructura del proyecto

### 1. Punto de entrada a la red: `lib/stellarServer.ts`

Aquí se crea el **cliente de Horizon** apuntando a Testnet:

- No hay nodo propio, no hay Soroban.
- Solo la URL del Horizon público de testnet.
- Con esto ya puedes: leer cuentas, balances, transacciones y **enviar** transacciones firmadas.

**Enfoque para la clase:** “Todo lo que hacemos de pagos pasa por este cliente: consultas y envío de transacciones. Cero smart contracts.”

---

### 2. Cómo se arma y envía un pago: `lib/sendXlmPayment.ts`

Aquí se ve el flujo típico de un **pago clásico**:

1. **Cargar la cuenta origen** con `stellarServer.loadAccount(sourcePublicKey)` (necesario para el sequence number).
2. **Construir la operación** con `Operation.payment()`: destino, activo (XLM nativo), monto.
3. **Armar la transacción** con `TransactionBuilder` (fee, network passphrase, timeout).
4. **Firmar** con la wallet (Wallets Kit), no con un contrato.
5. **Enviar** con `stellarServer.submitTransaction(signedTx)`.

Todo son **operaciones nativas de Stellar** (payment). No hay compilación de contratos, ni despliegue, ni invocación a Soroban.

**Enfoque para la clase:** “Este archivo es el núcleo del pago. Es solo: operación de pago → transacción → firma en la wallet → submit a Horizon. Nada de smart contracts.”

---

### 3. Conexión de wallet y persistencia: `context/StellarWalletContext.tsx` y `hooks/useStellarWalletKit.ts`

- **StellarWalletContext:** Crea el kit de wallets (testnet), abre el modal de conexión, guarda la dirección en estado y en **localStorage** para que no se pierda al cambiar de pestaña o recargar.
- **useStellarWalletKit:** Hook que expone `publicKey`, `connect`, `disconnect`, `kit` (para firmar).

La wallet firma la transacción que ya construimos en `sendXlmPayment`; no ejecuta ningún contrato.

**Enfoque para la clase:** “La wallet solo firma transacciones que nosotros armamos con el SDK. Sigue siendo el modelo clásico: tú construyes la transacción, el usuario la firma, Horizon la procesa.”

---

### 4. Balance y transacciones: `hooks/useStellarBalance.ts` y `hooks/useStellarTransactions.ts`

- **useStellarBalance:** Llama a `stellarServer.loadAccount(publicKey)` y mapea `account.balances` (XLM y otros activos).
- **useStellarTransactions:** Usa `stellarServer.transactions().forAccount(publicKey).order('desc').limit(10).call()`.

Todo vía **Horizon**: lecturas del ledger. Sin contratos, sin Soroban.

**Enfoque para la clase:** “Consultar balance e historial es solo leer de Horizon. Mismo cliente que ya usamos para enviar el pago.”

---

### 5. UI: `app/` y `components/`

- **app/page.tsx (Home):** Conectar wallet, ver balances, formulario (destino + monto) y botón “Send Payment” que llama a `sendXlmPayment`.
- **app/archive/page.tsx:** Lista de últimas transacciones (misma API de transacciones por cuenta).
- **app/profile/page.tsx:** Mostrar dirección (y copiarla), balances, desconectar.
- **components/Dock.tsx + AppDock.tsx:** Navegación tipo dock (Home, Archive, Profile).

**Enfoque para la clase:** “La UI solo orquesta: conecta wallet, lee balance/transacciones por Horizon, y al enviar arma la transacción con el SDK y pide a la wallet que la firme. Todo el ‘cerebro’ del pago está en `sendXlmPayment` y en Horizon.”

---

## Flujo completo de un pago (sin contratos)

1. Usuario conecta wallet → guardamos `publicKey` (y opcionalmente en localStorage).
2. Para mostrar balance → `loadAccount(publicKey)` por Horizon.
3. Usuario escribe destino y monto y pulsa “Send”:
   - Se llama `sendXlmPayment(kit, sourcePublicKey, destination, amount)`.
   - Dentro: `loadAccount` → `Operation.payment` → `TransactionBuilder` → `kit.signTransaction` → `submitTransaction`.
4. Horizon incluye la transacción en el ledger; el balance y el historial se actualizan leyendo otra vez de Horizon.

En ningún paso interviene un smart contract.

---

## Cuándo SÍ hace falta un smart contract (Soroban)

- Lógica condicional compleja (ej. “solo liberar fondos si se cumple X”).
- Escrow, acuerdos multi‑firma, reglas de negocio on‑chain.
- Tokens o activos con comportamiento programable.
- Aplicaciones descentralizadas que mantienen estado on‑chain más allá de “cuenta + balances”.

Para **“enviar X LM de mi cuenta a la tuya”**, el modelo clásico (cuentas + operaciones + Horizon) es suficiente y más simple.

---

## Resumen para la clase

| Qué hicimos | Con qué (sin smart contracts) |
|-------------|-------------------------------|
| Conectar wallet | Stellar Wallets Kit + contexto + localStorage |
| Ver balance | Horizon: `loadAccount` → `balances` |
| Ver transacciones | Horizon: `transactions().forAccount(...)` |
| Enviar XLM | `Operation.payment` + `TransactionBuilder` + firma en wallet + `submitTransaction` a Horizon |

**Mensaje para cerrar:** Para pagos directos en Stellar (XLM o activos estándar), el flujo es: **cuentas, operaciones clásicas y Horizon**. Los smart contracts (Soroban) son una herramienta adicional para casos en los que necesitas lógica programable on‑chain; no son obligatorios para construir una app de pagos como esta.
