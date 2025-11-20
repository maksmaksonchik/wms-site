import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { Schedule, Event } from "../src/components/schedule/schedule.types";

/**
 * Парсит ICS файл в формат Schedule
 */
function parseICS(icsContent: string): Schedule {
  const events: Event[] = [];
  const lines = icsContent.split(/\r?\n/);
  
  let currentEvent: Partial<Event> | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Начало события
    if (line === "BEGIN:VEVENT") {
      currentEvent = {};
      continue;
    }
    
    // Конец события
    if (line === "END:VEVENT" && currentEvent) {
      if (currentEvent.date && currentEvent.startTime && currentEvent.title) {
        events.push({
          date: currentEvent.date,
          startTime: currentEvent.startTime,
          endTime: currentEvent.endTime,
          title: currentEvent.title,
          description: currentEvent.description,
          speaker: currentEvent.speaker,
          image: currentEvent.image,
        });
      }
      currentEvent = null;
      continue;
    }
    
    // Парсинг свойств события
    if (currentEvent) {
      // DTSTART: формат 20250129T100000
      if (line.startsWith("DTSTART:")) {
        const dtStart = line.substring(8).trim();
        const date = parseICSDate(dtStart);
        currentEvent.date = date.date;
        currentEvent.startTime = date.time;
      }
      
      // DTEND: формат 20250129T130000
      if (line.startsWith("DTEND:")) {
        const dtEnd = line.substring(6).trim();
        const date = parseICSDate(dtEnd);
        currentEvent.endTime = date.time;
      }
      
      // SUMMARY: название события
      if (line.startsWith("SUMMARY:")) {
        currentEvent.title = line.substring(8).trim();
      }
      
      // DESCRIPTION: описание, может содержать спикера
      if (line.startsWith("DESCRIPTION:")) {
        let desc = line.substring(12).trim();
        
        // Обработка экранированных символов и Unicode escape sequences
        desc = desc
          .replace(/\\n/g, "\n")
          .replace(/\\,/g, ",")
          .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
          .replace(/\\x([0-9a-fA-F]{2})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
        
        // Если описание пустое, пропускаем
        if (!desc) {
          currentEvent.description = undefined;
          continue;
        }
        
        // Удаляем эмодзи и специальные символы для поиска имени
        const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{200D}\u{FE0F}\u00A0]/gu;
        const cleanDesc = desc.replace(emojiRegex, " ").trim();
        
        // Если весь текст - это короткое название организации (2-30 символов, без пробелов или с дефисами)
        const shortOrgPattern = /^[А-ЯЁ][А-ЯЁа-яё\-]{1,29}$/;
        if (shortOrgPattern.test(cleanDesc)) {
          currentEvent.speaker = cleanDesc;
          currentEvent.description = undefined;
        } else {
          // Ищем имя спикера в конце (формат: Фамилия Имя Отчество или организация)
          // Пример: "🕵🏻‍♀️ Вихарев Сергей Викторович" -> "Вихарев Сергей Викторович"
          const speakerPattern = /([А-ЯЁ][А-ЯЁа-яё]+\s+[А-ЯЁ][А-ЯЁа-яё]+(?:\s+[А-ЯЁ][А-ЯЁа-яё]+)?|[А-ЯЁ][А-ЯЁа-яё\-]{2,50})$/;
          const speakerMatch = cleanDesc.match(speakerPattern);
          
          if (speakerMatch) {
            const speakerName = speakerMatch[1].trim();
            // Если имя в конце строки, отделяем его от описания
            const descWithoutSpeaker = cleanDesc.replace(speakerPattern, "").trim();
            
            if (descWithoutSpeaker) {
              // Если есть текст до имени - это описание
              currentEvent.description = descWithoutSpeaker;
            }
            currentEvent.speaker = speakerName;
          } else {
            // Если имени нет, весь текст - это описание
            currentEvent.description = desc;
          }
        }
      }
    }
  }
  
  // Группируем события по датам
  const scheduleMap = new Map<string, Event[]>();
  
  for (const event of events) {
    if (!scheduleMap.has(event.date)) {
      scheduleMap.set(event.date, []);
    }
    scheduleMap.get(event.date)!.push(event);
  }
  
  // Преобразуем в массив DaySchedule, отсортированный по дате
  const schedule: Schedule = Array.from(scheduleMap.entries())
    .map(([date, events]) => ({
      date,
      events: events.sort((a, b) => 
        a.startTime.localeCompare(b.startTime)
      ),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return schedule;
}

/**
 * Парсит дату и время из формата ICS (20250129T100000)
 */
function parseICSDate(icsDate: string): { date: string; time: string } {
  // Формат: YYYYMMDDTHHMMSS или YYYYMMDDTHHMMSSZ
  const match = icsDate.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  
  if (!match) {
    throw new Error(`Invalid ICS date format: ${icsDate}`);
  }
  
  const [, year, month, day, hour, minute] = match;
  const date = `${year}-${month}-${day}`;
  const time = `${hour}:${minute}`;
  
  return { date, time };
}

/**
 * Форматирует Schedule в TypeScript код
 */
function formatSchedule(schedule: Schedule): string {
  const lines: string[] = [
    `import type { Schedule } from "./schedule.types";`,
    ``,
    `export const schedule2025: Schedule = ${JSON.stringify(schedule, null, 2)};`,
  ];
  
  return lines.join("\n");
}

// Основная функция
function main() {
  const inputPath = join(__dirname, "../src/components/schedule/schedule_2025.ics");
  const outputPath = join(__dirname, "../src/components/schedule/schedule_2025.mock.ts");
  
  console.log(`Reading ICS file from: ${inputPath}`);
  const icsContent = readFileSync(inputPath, "utf-8");
  
  console.log("Parsing ICS file...");
  const schedule = parseICS(icsContent);
  
  console.log(`Parsed ${schedule.length} days with ${schedule.reduce((sum, day) => sum + day.events.length, 0)} events`);
  
  console.log(`Writing output to: ${outputPath}`);
  const output = formatSchedule(schedule);
  writeFileSync(outputPath, output, "utf-8");
  
  console.log("Done!");
}

main();

