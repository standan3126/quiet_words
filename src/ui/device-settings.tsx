import { useEffect, useRef, useState } from 'preact/hooks'
import { backupFileName, makeBackup, readBackup, restoreBackup, type Backup } from '../meta/backup'
import { canPromptInstall, isApple, isInstalled, onInstallChange, promptInstall } from '../meta/install'

function InstallSection() {
  const [, refresh] = useState(0)
  useEffect(() => onInstallChange(() => refresh((n) => n + 1)), [])
  const secure = window.isSecureContext

  return (
    <section class="panel">
      <h3>Add to your home screen</h3>
      {isInstalled() ? (
        <p class="soft">Installed. Quiet Words opens like an app and works without the internet.</p>
      ) : canPromptInstall() ? (
        <>
          <p class="soft">Install Quiet Words so it opens like an app and works without the internet.</p>
          <button class="add-photos" onClick={promptInstall}>
            Install
          </button>
        </>
      ) : !secure ? (
        <p class="soft">Installing needs the game's secure web address (starting with https). This address is for trying it out at home.</p>
      ) : isApple() ? (
        <ol class="steps">
          <li>Tap the Share button (the square with an arrow) in Safari.</li>
          <li>Scroll down and tap "Add to Home Screen".</li>
          <li>Tap "Add".</li>
        </ol>
      ) : (
        <ol class="steps">
          <li>Open the browser menu (⋮).</li>
          <li>Tap "Install app" or "Add to Home screen".</li>
        </ol>
      )}
    </section>
  )
}

function BackupSection() {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<Backup | null>(null)
  const [note, setNote] = useState<string | null>(null)

  const save = async () => {
    setBusy(true)
    try {
      const blob = await makeBackup()
      const file = new File([blob], backupFileName(), { type: 'application/json' })
      // Phones: the share sheet can save to Files, AirDrop, or send to yourself.
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Quiet Words backup' }).catch(() => {})
      } else {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = file.name
        a.click()
        setTimeout(() => URL.revokeObjectURL(a.href), 10_000)
      }
      setNote('Backup made. Keep the file somewhere safe, like your email or cloud storage.')
    } finally {
      setBusy(false)
    }
  }

  const pick = async (e: Event) => {
    const el = e.target as HTMLInputElement
    const file = el.files?.[0]
    el.value = ''
    if (!file) return
    try {
      setPending(await readBackup(file))
      setNote(null)
    } catch (err) {
      setNote((err as Error).message)
    }
  }

  const restore = async () => {
    setBusy(true)
    await restoreBackup(pending!)
    location.reload() // start fresh from the restored data
  }

  const photoCount = pending?.albums.reduce((n, a) => n + a.photos.length, 0) ?? 0
  return (
    <section class="panel">
      <h3>Backup</h3>
      <p class="soft note">Moving to a new phone, or to the game's new web address? Save a backup here, then restore it there.</p>
      <button class="add-photos" onClick={save} disabled={busy}>
        {busy && !pending ? 'Saving…' : 'Save a backup'}
      </button>
      <input ref={input} type="file" accept="application/json,.json" hidden onChange={pick} />
      <button class="add-photos" onClick={() => input.current!.click()} disabled={busy}>
        Restore from a backup
      </button>
      {note && (
        <p class="notice" role="status">
          {note}
        </p>
      )}
      {pending && (
        <div class="notice" role="dialog" aria-label="Restore backup">
          <p>
            Replace everything on this device with the backup from {new Date(pending.created).toLocaleDateString()}? It's at level{' '}
            {pending.progress.level}, with {pending.albums.length} album{pending.albums.length === 1 ? '' : 's'} ({photoCount} photo
            {photoCount === 1 ? '' : 's'}).
          </p>
          <button class="primary-button" onClick={restore} disabled={busy}>
            {busy ? 'Restoring…' : 'Restore'}
          </button>
          <button class="text-button" onClick={() => setPending(null)}>
            Cancel
          </button>
        </div>
      )}
    </section>
  )
}

export function DeviceSettings() {
  return (
    <>
      <InstallSection />
      <BackupSection />
    </>
  )
}
