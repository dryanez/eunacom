import Foundation
import CoreSpotlight
import MobileCoreServices

/// CoreSpotlight indexer allowing direct searching of EUNACOM codes (e.g. 1.01.1.001) and diseases from iOS search.
public final class SpotlightIndexer {
    public static let shared = SpotlightIndexer()
    
    private init() {}
    
    public func indexQuestions(_ questions: [QuestionItem]) {
        var items: [CSSearchableItem] = []
        
        for q in questions {
            let attributeSet = CSSearchableItemAttributeSet(contentType: .text)
            attributeSet.title = "\(q.specialty): \(q.codigoEunacom ?? "Pregunta EUNACOM")"
            attributeSet.contentDescription = q.pregunta
            attributeSet.keywords = [q.specialty, q.codigoEunacom ?? "", "EUNACOM", "Medicina"] + (q.tags?.components(separatedBy: ",") ?? [])
            
            let item = CSSearchableItem(
                uniqueIdentifier: "eunacom_question_\(q.id)",
                domainIdentifier: "com.eunacom.questions",
                attributeSet: attributeSet
            )
            items.append(item)
        }
        
        CSSearchableIndex.default().indexSearchableItems(items) { error in
            if let error {
                print("Error indexing questions in CoreSpotlight: \(error)")
            }
        }
    }
}
