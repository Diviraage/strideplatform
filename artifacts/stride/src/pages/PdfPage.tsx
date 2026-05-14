import React, { useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useAssessment } from '@/context/AssessmentContext';

export default function PdfPage() {
  const [, setLocation] = useLocation();
  const { result, selectedTests, bigFiveScores, bigFiveType, p16Type, p16Scores, aiTexts, selectedProf, matchPct, duration, frequency, resetAssessment } = useAssessment();

  const [cbStride, setCbStride] = useState(true);
  const [cbB5, setCbB5]  = useState(selectedTests.includes('b5'));
  const [cb16p, setCb16p] = useState(selectedTests.includes('16p'));
  const [cbProf, setCbProf] = useState(!!selectedProf);
  const [cbMentor, setCbMentor] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const PDESC: Record<string, string> = {
    'Системний Архітектор': 'Твій мозок оптимізований під побудову логічних моделей у хаосі.',
    'Синтетичний Дослідник': "Ти збираєш пазли з різних галузей і бачиш зв'язки, які інші пропускають.",
    'Глибинний Спеціаліст': 'Твоя сила — у граничній концентрації.',
    'Адаптивний Стратег': 'Ти вміло балансуєш між аналізом і дією.',
  };

  const makePDFSection = (opts: any) => {
    const W = 794, pad = 48;
    const el = document.createElement('div');
    el.style.cssText = `width:${W}px;font-family:'Manrope',sans-serif;background:#1A0A3D;color:#fff;padding:${pad}px;box-sizing:border-box`;

    const hdr = document.createElement('div');
    hdr.style.cssText = `background:${opts.color};border-radius:10px;padding:14px 20px;margin-bottom:24px`;
    hdr.innerHTML = `<div style="font-size:11px;font-weight:700;letter-spacing:.15em;color:rgba(0,0,0,.6);margin-bottom:4px">${opts.eyebrow ?? ''}</div><div style="font-size:22px;font-weight:900;color:#fff">${opts.title}</div>`;
    el.appendChild(hdr);

    if (opts.desc) {
      const d = document.createElement('div');
      d.style.cssText = 'font-size:13px;color:rgba(255,255,255,.6);line-height:1.7;margin-bottom:20px';
      d.textContent = opts.desc;
      el.appendChild(d);
    }

    if (opts.bars) {
      opts.bars.forEach(([lbl, val, col]: [string, number, string]) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:12px';
        row.innerHTML = `<div style="width:160px;font-size:12px;color:rgba(255,255,255,.7);flex-shrink:0">${lbl}</div><div style="flex:1;height:12px;background:rgba(255,255,255,.1);border-radius:100px;overflow:hidden"><div style="width:${val}%;height:100%;background:${col};border-radius:100px"></div></div><div style="width:36px;text-align:right;font-size:13px;font-weight:700;color:${col}">${val}%</div>`;
        el.appendChild(row);
      });
    }

    if (opts.aiText && opts.aiText.length > 10) {
      const aiBlock = document.createElement('div');
      aiBlock.style.cssText = 'background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:16px;margin-top:16px';
      aiBlock.innerHTML = `<div style="font-size:10px;font-weight:700;letter-spacing:.12em;color:${opts.color};margin-bottom:8px">ШІ-АНАЛІЗ</div><div style="font-size:12px;color:rgba(255,255,255,.65);line-height:1.75;white-space:pre-wrap">${String(opts.aiText).slice(0, 800)}</div>`;
      el.appendChild(aiBlock);
    }

    return el;
  };

  const genPDF = async () => {
    if (!result) return;
    setStatus('loading');
    setErrMsg('');
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf') as any,
        import('html2canvas') as any,
      ]);

      const sections: HTMLElement[] = [];

      // Cover
      const cover = document.createElement('div');
      cover.style.cssText = 'width:794px;min-height:500px;background:#1A0A3D;font-family:Manrope,sans-serif;overflow:hidden';
      cover.innerHTML = `
        <div style="background:linear-gradient(135deg,#6B21D6,#4C0FB0);padding:52px 48px 40px">
          <div style="font-size:11px;font-weight:700;letter-spacing:.2em;color:#C8FF00;margin-bottom:16px">FUTURE IS NOW · ЛІКО-ШКОЛА</div>
          <div style="font-size:36px;font-weight:900;color:#fff;letter-spacing:-.02em;line-height:1.1;margin-bottom:8px">S.T.R.I.D.E. Pro</div>
          <div style="font-size:15px;color:rgba(255,255,255,.7);margin-bottom:32px">Персональний психометричний звіт</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
            ${[['Профіль', result.profile, '#C8FF00'], ['Дата', new Date().toLocaleDateString('uk-UA'), '#00D4A8'], ['Ціль', selectedProf?.name ?? '—', '#FF7F50']].map(([l,v,c]) => `<div style="background:rgba(255,255,255,.1);border-radius:12px;padding:14px"><div style="font-size:10px;color:rgba(255,255,255,.5);margin-bottom:4px">${l}</div><div style="font-size:13px;font-weight:700;color:${c}">${v}</div></div>`).join('')}
          </div>
        </div>
        <div style="height:5px;background:#C8FF00"></div>
      `;
      sections.push(cover);

      if (cbStride) {
        sections.push(makePDFSection({
          eyebrow: '01 · S.T.R.I.D.E. · АРХІТЕКТУРА МИСЛЕННЯ',
          title: result.profile,
          color: '#6B21D6',
          desc: PDESC[result.profile] ?? '',
          bars: [['Когнітивний процесинг', result.cogPct, '#C8FF00'], ['Енергоефективність', result.enPct, '#00D4A8'], ['Адаптивність', result.adPct, '#FF7F50']],
          aiText: aiTexts['ai-synth'] ?? '',
        }));
      }

      if (cbB5 && selectedTests.includes('b5')) {
        sections.push(makePDFSection({
          eyebrow: '02 · BIG FIVE (OCEAN) · ОСОБИСТІСНИЙ ВИМІР',
          title: bigFiveType || 'Big Five аналіз',
          color: '#00D4A8',
          bars: [
            ['Відкритість', bigFiveScores.openness, '#C8FF00'],
            ['Сумлінність', bigFiveScores.conscientiousness, '#00D4A8'],
            ['Екстраверсія', bigFiveScores.extraversion, '#6B21D6'],
            ['Доброзичливість', bigFiveScores.agreeableness, '#FF7F50'],
            ['Нейротизм', bigFiveScores.neuroticism, '#D4537E'],
          ],
        }));
      }

      if (cb16p && selectedTests.includes('16p')) {
        const p16Names: Record<string, string> = { INTJ:'Стратег-Архітектор',INTP:'Логік-Дослідник',ENTJ:'Командир',ENTP:'Полемік',INFJ:'Адвокат',INFP:'Медіатор',ENFJ:'Протагоніст',ENFP:'Активіст',ISTJ:'Адміністратор',ISFJ:'Захисник',ESTJ:'Менеджер',ESFJ:'Консул',ISTP:'Майстер',ISFP:'Авантюрист',ESTP:'Підприємець',ESFP:'Розважальник' };
        sections.push(makePDFSection({
          eyebrow: '03 · 16PERSONALITIES · ТИП ОСОБИСТОСТІ',
          title: `${p16Type} · ${p16Names[p16Type] ?? 'Унікальний тип'}`,
          color: '#FF7F50',
          desc: 'Тип визначений на основі 4 дихотомій MBTI: E/I, N/S, T/F, J/P.',
        }));
      }

      if (cbProf && selectedProf) {
        sections.push(makePDFSection({
          eyebrow: '04 · АНАЛІЗ ВІДПОВІДНОСТІ ПРОФЕСІЇ',
          title: selectedProf.name,
          color: '#8B45E8',
          desc: selectedProf.desc,
          aiText: aiTexts['ai-match'] ?? '',
        }));
      }

      if (cbMentor) {
        const tot = Math.round(duration * 4 * frequency);
        sections.push(makePDFSection({
          eyebrow: '05 · МЕНТОРСЬКИЙ РОУДМЕП',
          title: `${duration} міс. · ${frequency}×/тижд. · ${tot} сесій`,
          color: '#C8FF00',
          aiText: aiTexts['ai-traj'] ?? '',
        }));
      }

      const doc = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4', hotfixes: ['px_scaling'] });
      const pageW = 794, pageH = 1123;
      doc.deletePage(1);

      const host = document.createElement('div');
      host.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1';
      document.body.appendChild(host);

      for (let si = 0; si < sections.length; si++) {
        setErrMsg(`Рендерю ${si + 1}/${sections.length}...`);
        const sec = sections[si];
        host.innerHTML = '';
        host.appendChild(sec);
        await new Promise(r => setTimeout(r, 80));

        const canvas = await html2canvas(sec, { scale: 1.5, useCORS: true, backgroundColor: '#1A0A3D', width: pageW, logging: false });
        const ratio = pageW / canvas.width;
        const scaledH = canvas.height * ratio;

        if (scaledH <= pageH) {
          doc.addPage([pageW, pageH], 'p');
          doc.addImage(canvas.toDataURL('image/jpeg', .88), 'JPEG', 0, 0, pageW, scaledH);
        } else {
          const sliceH = Math.floor(pageH / ratio);
          let srcY = 0;
          while (srcY < canvas.height) {
            const thisSlice = Math.min(sliceH, canvas.height - srcY);
            const sc2 = document.createElement('canvas');
            sc2.width = canvas.width; sc2.height = thisSlice;
            sc2.getContext('2d')!.drawImage(canvas, 0, -srcY);
            doc.addPage([pageW, pageH], 'p');
            doc.addImage(sc2.toDataURL('image/jpeg', .88), 'JPEG', 0, 0, pageW, thisSlice * ratio);
            srcY += thisSlice;
          }
        }
      }

      document.body.removeChild(host);

      const total = doc.internal.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFillColor(26, 10, 61); doc.rect(0, pageH - 24, pageW, 24, 'F');
        doc.setFillColor(200, 255, 0); doc.rect(0, pageH - 26, pageW, 2, 'F');
        doc.setFontSize(9); doc.setTextColor(150, 150, 150);
        doc.text(`Future is NOW · S.T.R.I.D.E. Pro · ${i}/${total}`, 24, pageH - 9);
      }

      doc.save('future-is-now-stride-report.pdf');
      setStatus('done');
    } catch (e: any) {
      setStatus('error');
      setErrMsg(e.message ?? 'Невідома помилка');
    }
  };

  return (
    <div className="v2-page" style={{ maxWidth: 840, margin: '0 auto', padding: '28px 16px 64px' }}>
      <div className="v2-eyebrow">03 · ДІЙ · ЗВІТ</div>
      <h2 style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Завантажити PDF</h2>

      <div className="v2-card" style={{ textAlign: 'center', padding: '22px 16px 20px', marginBottom: 14 }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>📄</div>
        <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 7 }}>Персональний звіт Future is NOW</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.68)', marginBottom: 18, maxWidth: 380, margin: '0 auto 18px' }}>
          Обери розділи — і завантаж красивий PDF із діаграмами та аналітикою
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 18 }}>
          {[
            { label: 'S.T.R.I.D.E.', checked: cbStride, setter: setCbStride, always: true },
            { label: 'Big Five', checked: cbB5, setter: setCbB5, disabled: !selectedTests.includes('b5') },
            { label: '16Personalities', checked: cb16p, setter: setCb16p, disabled: !selectedTests.includes('16p') },
            { label: 'Аналіз професії', checked: cbProf, setter: setCbProf, disabled: !selectedProf },
            { label: 'Менторський план', checked: cbMentor, setter: setCbMentor },
          ].map(item => (
            <label key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: item.disabled ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.68)', cursor: item.disabled ? 'default' : 'pointer' }}>
              <input
                type="checkbox"
                checked={item.checked}
                disabled={item.disabled}
                onChange={e => item.setter(e.target.checked)}
                style={{ accentColor: '#C8FF00' }}
              />
              {item.label}
            </label>
          ))}
        </div>

        <button
          className="v2-btn-primary"
          onClick={genPDF}
          disabled={status === 'loading' || !result}
          style={{ fontSize: 14, padding: '13px 28px' }}
        >
          {status === 'loading' ? `⏳ ${errMsg || 'Генерую...'}` : status === 'done' ? '✅ PDF завантажено!' : status === 'error' ? '❌ Спробувати знову' : '⬇ Згенерувати та завантажити PDF'}
        </button>
        {status === 'error' && (
          <div style={{ marginTop: 10, fontSize: 12, color: '#FF7F50' }}>Помилка: {errMsg}</div>
        )}
      </div>

      <div className="v2-card">
        <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 10, color: '#C8FF00', letterSpacing: '.1em', marginBottom: 12 }}>ЩО ВКЛЮЧАЄ ПОВНИЙ ЗВІТ</div>
        <ul style={{ fontSize: 12, color: 'rgba(255,255,255,.68)', lineHeight: 2 }}>
          {[
            'Когнітивний профіль S.T.R.I.D.E. — 3 вектори',
            'Big Five OCEAN — 5 рис особистості',
            '16Personalities — тип та опис',
            'ШІ-синтез трьох профілів',
            'Аналіз відповідності з gauge-діаграмою',
            'Карта саморозвитку з кроками',
            'Візія майбутнього (персоналізована)',
            'Менторський роудмеп на обраний термін',
          ].map(item => (
            <li key={item} style={{ listStyle: 'none', paddingLeft: 17, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#00D4A8', fontWeight: 700 }}>✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '.5px solid rgba(255,255,255,.07)', display: 'flex', justifyContent: 'space-between' }}>
        <button className="v2-btn-ghost" onClick={() => setLocation('/result')}>← Назад</button>
        <button className="v2-btn-secondary" onClick={() => { resetAssessment(); setLocation('/'); }}>↺ Пройти заново</button>
      </div>
    </div>
  );
}
