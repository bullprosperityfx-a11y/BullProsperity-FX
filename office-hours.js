(() => {
  "use strict";
  const $ = selector => document.querySelector(selector);
  const state = { slots:[], bookings:[], discordInvite:"https://discord.gg/qJaeBkTn3n" };
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
  const formatDate = value => new Intl.DateTimeFormat("de-DE", { weekday:"short", day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit", timeZone:"Europe/Berlin" }).format(new Date(value));

  function setStatus(message, type = "") { const box=$("#bookingStatus"); box.textContent=message; box.className=`office-status ${type}`.trim(); }
  function available(slot) { return Math.max(0, Number(slot.capacity) - Number(slot.booked || 0)); }

  function renderSlots() {
    const grid=$("#slotGrid"); const select=$("#slotSelect"); const current=select.value;
    select.innerHTML='<option value="">Termin auswählen</option>'+state.slots.filter(slot=>available(slot)>0).map(slot=>`<option value="${escapeHtml(slot.id)}">${escapeHtml(formatDate(slot.starts_at))} · ${escapeHtml(slot.topic)}</option>`).join("");
    if(state.slots.some(slot=>slot.id===current&&available(slot)>0))select.value=current;
    grid.innerHTML=state.slots.length?state.slots.map(slot=>{const free=available(slot),full=free===0;return`<article class="slot-card ${full?'is-full':''}"><div class="slot-date"><strong>${escapeHtml(formatDate(slot.starts_at))}</strong><span>${full?'Ausgebucht':`${free} frei`}</span></div><p>${escapeHtml(slot.topic)}</p><div class="slot-meta"><span>${Number(slot.duration_minutes)} Minuten</span><span>${escapeHtml(slot.discord_channel||'#office-hours')}</span><span>${Number(slot.booked||0)}/${Number(slot.capacity)} Plätze</span></div><button class="office-btn ${full?'secondary':'primary'} small" type="button" data-select-slot="${escapeHtml(slot.id)}" ${full?'disabled':''}>${full?'Keine Plätze':'Termin auswählen'}</button></article>`}).join(""):'<div class="office-empty">Aktuell sind keine neuen Sessions veröffentlicht.</div>';
    grid.querySelectorAll("[data-select-slot]").forEach(button=>button.addEventListener("click",()=>{select.value=button.dataset.selectSlot;$("#bookingForm").scrollIntoView({behavior:"smooth",block:"center"});setStatus("Termin ausgewählt. Ergänze jetzt Discord-Name und Frage.");}));
  }

  function renderBookings() {
    const list=$("#bookingList");
    list.innerHTML=state.bookings.length?state.bookings.map(booking=>{const slot=booking.office_hour_slots||{};return`<article class="booking-item"><div><h3>${escapeHtml(slot.topic||'Mentor Office Hours')}</h3><p>${escapeHtml(formatDate(slot.starts_at))} · ${Number(slot.duration_minutes||60)} Minuten · ${escapeHtml(slot.discord_channel||'#office-hours')}</p><p>Frage: ${escapeHtml(booking.question)}</p></div><div class="booking-actions"><button class="office-btn secondary small" type="button" data-calendar="${escapeHtml(booking.id)}">Kalenderdatei</button><a class="office-btn primary small" href="${escapeHtml(state.discordInvite)}" target="_blank" rel="noopener noreferrer">Discord öffnen</a><button class="office-btn secondary small" type="button" data-cancel="${escapeHtml(booking.id)}">Stornieren</button></div></article>`}).join(""):'<div class="office-empty">Du hast aktuell keine bestätigten Office-Hours-Termine.</div>';
    list.querySelectorAll("[data-calendar]").forEach(button=>button.addEventListener("click",()=>downloadCalendar(state.bookings.find(item=>item.id===button.dataset.calendar))));
    list.querySelectorAll("[data-cancel]").forEach(button=>button.addEventListener("click",()=>cancelBooking(button.dataset.cancel,button)));
  }

  async function loadOfficeHours() {
    $("#refreshSlots").disabled=true;
    try{const response=await fetch("/api/office-hours",{credentials:"include",cache:"no-store"});const data=await response.json();if(!response.ok)throw new Error(data.error||"Termine konnten nicht geladen werden");state.slots=data.slots||[];state.bookings=data.bookings||[];state.discordInvite=data.discordInvite||state.discordInvite;$("#discordTopLink").href=state.discordInvite;$("#discordBookingLink").href=state.discordInvite;renderSlots();renderBookings();}
    catch(error){$("#slotGrid").innerHTML=`<div class="office-empty">${escapeHtml(error.message)}</div>`;$("#bookingList").innerHTML='<div class="office-empty">Buchungen konnten nicht geladen werden.</div>';setStatus(error.message,"error");}
    finally{$("#refreshSlots").disabled=false;}
  }

  async function bookOfficeHour(event) {
    event.preventDefault(); const button=$("#bookSlot"); button.disabled=true; button.textContent="Buchung läuft …";
    try{const response=await fetch("/api/office-hours",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({slotId:$("#slotSelect").value,memberName:$("#memberName").value,discordUsername:$("#discordUsername").value,question:$("#officeQuestion").value})});const data=await response.json();if(!response.ok)throw new Error(data.error||"Buchung fehlgeschlagen");state.discordInvite=data.discordInvite||state.discordInvite;setStatus(data.discordNotified?"Buchung bestätigt. Der Mentor-Discord wurde informiert.":"Buchung bestätigt. Öffne jetzt den Mentor-Discord.","good");$("#officeQuestion").value="";$("#discordConsent").checked=false;await loadOfficeHours();}
    catch(error){setStatus(error.message,"error");}
    finally{button.disabled=false;button.textContent="Verbindlich buchen";}
  }

  async function cancelBooking(id, button) {
    button.disabled=true;
    try{const response=await fetch("/api/office-hours",{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId:id})});const data=await response.json();if(!response.ok)throw new Error(data.error||"Stornierung fehlgeschlagen");setStatus("Termin wurde storniert.","good");await loadOfficeHours();}
    catch(error){setStatus(error.message,"error");button.disabled=false;}
  }

  function downloadCalendar(booking) {
    const slot=booking?.office_hour_slots;if(!slot)return;const start=new Date(slot.starts_at);const end=new Date(start.getTime()+Number(slot.duration_minutes||60)*60000);const stamp=value=>value.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");const safe=value=>String(value||"").replace(/[\\;,\n]/g,char=>`\\${char}`);const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//BullProsperity//Office Hours//DE","BEGIN:VEVENT",`UID:${booking.id}@bullprosperity.online`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,`SUMMARY:${safe(slot.topic||"BullProsperity Mentor Office Hours")}`,`DESCRIPTION:${safe(`Teilnahme über BullProsperity Discord ${slot.discord_channel||"#office-hours"}`)}`,`URL:${state.discordInvite}`,"END:VEVENT","END:VCALENDAR"].join("\r\n");const blob=new Blob([ics],{type:"text/calendar;charset=utf-8"});const link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download="bullprosperity-office-hours.ics";link.click();setTimeout(()=>URL.revokeObjectURL(link.href),500);
  }

  async function initialize() { try{const access=await fetch("/api/access",{credentials:"include",cache:"no-store"}).then(response=>response.json());if(access.firstName)$("#memberName").value=access.firstName;}catch{}$("#bookingForm").addEventListener("submit",bookOfficeHour);$("#refreshSlots").addEventListener("click",loadOfficeHours);loadOfficeHours(); }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});else initialize();
})();

