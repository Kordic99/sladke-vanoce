"use client";

import { useEffect, useRef, useState } from "react";
import { Smartphone, Share, PlusSquare, X } from "lucide-react";

export function MobileGuide({ browserStorage }: { browserStorage: boolean }) {
  const [open, setOpen] = useState(false);
  return <><button onClick={() => setOpen(true)}><Smartphone size={15}/>Na iPhone</button>{open && <MobileGuideDialog browserStorage={browserStorage} onClose={() => setOpen(false)}/>}</>;
}

function MobileGuideDialog({ browserStorage, onClose }: { browserStorage: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="mobile-guide-dialog" aria-labelledby="mobile-guide-title" onCancel={onClose}>
    <div className="mobile-guide-heading"><Smartphone size={26}/><h2 id="mobile-guide-title">Vánoce i v kapse</h2><button className="icon-button" aria-label="Zavřít návod pro iPhone" onClick={onClose}><X size={22}/></button></div>
    <div className="mobile-guide-content"><p>Otevřete odkaz v Safari na iPhonu.</p><ol><li><Share size={19}/><span>Klepněte na <strong>Sdílet</strong> v nabídce Safari.</span></li><li><PlusSquare size={19}/><span>Vyberte <strong>Přidat na plochu</strong>. Je-li dostupná volba <strong>Otevřít jako webovou aplikaci</strong>, zapněte ji. Potvrďte <strong>Přidat</strong>.</span></li></ol><p>Na ploše pak najdete vlastní ikonu Sladké Vánoce.</p>
    {browserStorage ? <><h3>Jak přenést recepty</h3><p>Na počítači zvolte <strong>Stáhnout zálohu</strong>. Soubor JSON přeneste do iPhonu, třeba přes iCloud Drive. V mobilním dashboardu klepněte na <strong>Načíst zálohu</strong> a vyberte ho v Souborech.</p><p className="mobile-guide-note">Seznam se ukládá zvlášť na každém zařízení. Domácí odkaz funguje ve stejné Wi-Fi se zapnutým počítačem; změny se mezi zařízeními automaticky nesynchronizují.</p></> : <p className="mobile-guide-note">Pro své uložené recepty se na iPhonu přihlaste stejným účtem. Starší seznam ze souboru přenesete pomocí tlačítka Načíst zálohu.</p>}
    <button className="primary-button" onClick={onClose}>Rozumím</button></div>
  </dialog>;
}
